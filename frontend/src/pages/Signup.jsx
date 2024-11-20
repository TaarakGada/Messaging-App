// src/pages/Signup.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import Cookies from 'js-cookie';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCookieAllowed, setIsCookieAllowed] = useState(false);
    const navigate = useNavigate();

    const handleCookiePermission = () => {
        const allowCookies = window.confirm(
            'This app requires permission to store cookies for authentication. Do you agree?'
        );
        setIsCookieAllowed(allowCookies);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await axiosInstance.post('auth/signup', formData, {
                withCredentials: true,
            });

            const { accessToken, refreshToken } = response.data.data || {};

            if (response.data.statusCode === 201 && isCookieAllowed) {
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                Cookies.set('accessToken', accessToken);
                Cookies.set('refreshToken', refreshToken);

                if (!accessToken) {
                    setError(
                        'Account creation succeeded, but authentication failed. Please log in.'
                    );
                    navigate('/login');
                } else {
                    navigate('/chat');
                }
            } else if (!isCookieAllowed) {
                setError(
                    'Cookie permission is required for signup. Please enable cookies and try again.'
                );
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    'An error occurred during signup. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gray-900">
            <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-lg shadow-2xl">
                {/* Cookie Permission */}
                {!isCookieAllowed && (
                    <div
                        className="bg-yellow-500/10 border border-yellow-500 text-yellow-500 px-4 py-3 rounded relative"
                        role="alert"
                    >
                        <p className="text-sm">
                            This app requires cookies for authentication.
                        </p>
                        <button
                            onClick={handleCookiePermission}
                            className="mt-2 text-blue-500 hover:text-blue-400"
                        >
                            Allow Cookies
                        </button>
                    </div>
                )}

                {/* Header */}
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-white">
                        Create Your Account
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="font-medium text-blue-500 hover:text-blue-400 transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div
                        className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded relative"
                        role="alert"
                    >
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {/* Form */}
                <form
                    className="mt-8 space-y-6"
                    onSubmit={handleSubmit}
                >
                    <div className="space-y-4">
                        {/* Username Field */}
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-gray-300"
                            >
                                Username
                            </label>
                            <div className="mt-1">
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter your username"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-300"
                            >
                                Email
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-300"
                            >
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                                isLoading
                                    ? 'bg-blue-600/50 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                            } transition-colors`}
                        >
                            {isLoading ? 'Signing up...' : 'Sign up'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
