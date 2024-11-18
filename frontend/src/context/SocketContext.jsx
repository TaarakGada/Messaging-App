// src/context/SocketContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Cookies from 'js-cookie';

const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const accessToken = Cookies.get('accessToken');
        if (accessToken) {
            const newSocket = io('https://messaging-app-test.onrender.com', {
                withCredentials: true,
                transports: ['websocket', 'polling'],
                auth: {
                    token: accessToken,
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
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
        }
    }, []);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
