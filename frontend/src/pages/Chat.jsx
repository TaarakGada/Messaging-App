import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import axiosInstance from '../utils/axiosInstance';

const Chat = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { socket } = useSocket();

    const fetchOnlineUsers = async () => {
        try {
            const response = await axiosInstance.get('/chat/getonlineusers', {
                withCredentials: true,
            });

            if (response?.data?.data) {
                setUsers(response.data.data);
                setError('');
            } else {
                setUsers([]);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    'Failed to fetch online users. Please try again.'
            );
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const initializeSocketListeners = () => {
            if (socket && socket.connected) {
                // Ensure the user list is fetched once when the component loads
                fetchOnlineUsers();

                // Add listener for user status changes
                socket.on('user-status-changed', fetchOnlineUsers);
            } else {
                // If socket is not connected, wait for the connection event
                socket.on('connect', () => {
                    fetchOnlineUsers();
                    socket.on('user-status-changed', fetchOnlineUsers);
                });
            }
        };

        initializeSocketListeners();

        // Cleanup: Remove listeners on unmount
        return () => {
            if (socket) {
                socket.off('user-status-changed', fetchOnlineUsers);
                socket.off('connect');
            }
        };
    }, [socket]);

    const handleUserClick = (userId) => {
        navigate(`/chat/${userId}`);
    };

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white">
                        Online Users
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Select a user to start chatting
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
                        {users.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="mt-4 text-gray-400">
                                    No users are currently online
                                </p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-700">
                                {users.map((user) => (
                                    <li
                                        key={user._id}
                                        onClick={() =>
                                            handleUserClick(user._id)
                                        }
                                        className="hover:bg-gray-700 transition-colors cursor-pointer"
                                    >
                                        <div className="px-6 py-4 flex items-center space-x-4">
                                            <div className="relative flex-shrink-0">
                                                {user.avatar ? (
                                                    <img
                                                        src={user.avatar}
                                                        alt={`${user.username}'s avatar`}
                                                        className="h-12 w-12 rounded-full object-cover border-2 border-blue-500"
                                                    />
                                                ) : (
                                                    <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center border-2 border-blue-500">
                                                        <span className="text-gray-400">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                                stroke="currentColor"
                                                                className="w-6 h-6"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                                                                />
                                                            </svg>
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">
                                                    {user.username}
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
