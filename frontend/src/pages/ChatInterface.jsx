import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ChatInterface = () => {
    const { id } = useParams(); // User ID from the URL
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState('');
    const chatContainerRef = useRef(null);

    // Placeholder for socket instance
    const socket = null; // Replace with your Socket.IO logic

    // Fetch conversation history
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get(
                    `your-api-endpoint/conversations/${id}`
                );
                setMessages(response.data);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                        'Failed to load conversation. Please try again.'
                );
            }
        };
        fetchMessages();

        // Placeholder for receiving messages via socket
        if (socket) {
            socket.on('receiveMessage', (message) => {
                setMessages((prevMessages) => [...prevMessages, message]);
                scrollToBottom();
            });
        }

        return () => {
            if (socket) {
                socket.off('receiveMessage');
            }
        };
    }, [id]);

    // Scroll to bottom of chat container
    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight;
        }
    };

    // Send message
    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const messageData = {
            senderId: 'your-user-id', // Replace with sender's ID
            receiverId: id,
            text: newMessage.trim(),
            timestamp: new Date(),
        };

        try {
            setMessages((prevMessages) => [...prevMessages, messageData]); // Optimistic UI update
            if (socket) {
                socket.emit('sendMessage', messageData); // Replace with your emit logic
            }
            setNewMessage('');
            scrollToBottom();
        } catch (err) {
            console.error('Message failed to send:', err);
            setError('Failed to send message. Please try again.');
        }
    };

    // Handle copy message
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Message copied to clipboard!');
        });
    };

    // Auto-scroll when messages update
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="max-w-4xl mx-auto p-6">
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        Chat with User {id}
                    </h2>
                </div>

                {/* Error Alert */}
                {error && (
                    <div
                        className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6"
                        role="alert"
                    >
                        <span>{error}</span>
                    </div>
                )}

                {/* Chat Container */}
                <div
                    className="bg-gray-800 rounded-lg shadow-xl overflow-y-auto h-96 p-4 mb-4"
                    ref={chatContainerRef}
                >
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-400">
                            No messages yet.
                        </div>
                    ) : (
                        <ul>
                            {messages.map((message, index) => (
                                <li
                                    key={index}
                                    className={`flex items-start space-x-4 mb-4 ${
                                        message.senderId === 'your-user-id'
                                            ? 'justify-end'
                                            : ''
                                    }`}
                                >
                                    <div
                                        className={`p-3 rounded-lg text-sm shadow-md ${
                                            message.senderId === 'your-user-id'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-700 text-gray-200'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span>{message.text}</span>
                                            <button
                                                className="ml-2 text-gray-400 hover:text-gray-300"
                                                onClick={() =>
                                                    copyToClipboard(
                                                        message.text
                                                    )
                                                }
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    className="w-4 h-4"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M7.5 6.75h9M7.5 9.75h4.5M15 3.75a3 3 0 013 3v10.5a3 3 0 01-3 3h-6a3 3 0 01-3-3V6.75a3 3 0 013-3h6z"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="mt-1 text-xs text-gray-400">
                                            {new Date(
                                                message.timestamp
                                            ).toLocaleTimeString()}
                                            {message.read && (
                                                <span className="ml-2 text-green-500">
                                                    ✓ Read
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Input Section */}
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 p-3 rounded-lg bg-gray-800 text-white focus:ring focus:ring-blue-500"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button
                        className="p-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                        onClick={sendMessage}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
