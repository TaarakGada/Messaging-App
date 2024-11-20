// src/context/SocketContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Cookies from 'js-cookie';

const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Fetch the token from both cookies and local storage
        const accessToken =
            Cookies.get('accessToken') || localStorage.getItem('accessToken');

        if (accessToken) {
            const newSocket = io('https://messaging-app-test.onrender.com', {
                withCredentials: true,
                transports: ['websocket', 'polling'],
                auth: {
                    token: accessToken, // Token passed to Socket.IO server
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`, // Token included in headers
                },
            });

            newSocket.on('connect', () => {
                console.log('Socket connected successfully');
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                console.error('Error details:', error.message);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        } else {
            console.warn('No access token found in cookies or local storage.');
        }
    }, []); // Empty dependency array ensures the effect runs only once

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
