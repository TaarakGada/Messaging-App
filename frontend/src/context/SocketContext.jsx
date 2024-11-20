// src/context/SocketContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Cookies from 'js-cookie';

const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    const initializeSocket = (token) => {
        if (token) {
            const newSocket = io('https://messaging-app-test.onrender.com', {
                withCredentials: true,
                transports: ['websocket', 'polling'],
                auth: {
                    token,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            newSocket.on('connect', () => {
                console.log('Socket connected successfully');
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });

            setSocket(newSocket);

            return newSocket;
        }
    };

    useEffect(() => {
        const accessToken =
            Cookies.get('accessToken') || localStorage.getItem('accessToken');

        // Initialize socket on first render or when token changes
        const newSocket = initializeSocket(accessToken);

        return () => {
            if (newSocket) newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const accessToken =
                Cookies.get('accessToken') ||
                localStorage.getItem('accessToken');
            if (!socket && accessToken) {
                console.log('Reinitializing socket after token retrieval.');
                initializeSocket(accessToken);
            }
        }, 1000); // Retry every 1 second if the socket is missing and the token exists

        return () => clearInterval(interval); // Clean up the interval on unmount
    }, [socket]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
