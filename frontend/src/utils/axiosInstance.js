import axios from 'axios';
import Cookies from 'js-cookie';

const axiosInstance = axios.create({
    baseURL: 'https://messaging-app-test.onrender.com/api/v1',
    withCredentials: true, // Keep this to send cookies along with requests
});

// Interceptor to add token to the Authorization header
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken =
            localStorage.getItem('accessToken') || Cookies.get('accessToken');
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor to handle token refresh
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Send the refresh token in the body (from cookies)
                const refreshToken = Cookies.get('refreshToken');
                const refreshResponse = await axios.post(
                    '/auth/refresh-token',
                    { refreshToken },
                    { withCredentials: true } // Keep withCredentials for cookies
                );

                // On successful refresh, retry the original request
                const { accessToken, refreshToken: newRefreshToken } =
                    refreshResponse.data;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);
                Cookies.set('accessToken', accessToken);
                Cookies.set('refreshToken', newRefreshToken);

                originalRequest.headers[
                    'Authorization'
                ] = `Bearer ${accessToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                window.location.href = '/login'; // Redirect to login on failure
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
