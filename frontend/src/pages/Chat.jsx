import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import axiosInstance from '../utils/axiosInstance';

const ChatUsers = () => {
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
            console.log('Fetched users:', response.data);

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
        fetchOnlineUsers();

        if (socket) {
            socket.on('user-status-changed', () => {
                fetchOnlineUsers();
            });
        }

        return () => {
            if (socket) {
                socket.off('user-status-changed');
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
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
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
                                            <div className="text-gray-400">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1.5}
                                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                                    />
                                                </svg>
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

export default ChatUsers;
