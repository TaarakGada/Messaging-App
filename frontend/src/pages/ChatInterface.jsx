import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import axiosInstance from '../utils/axiosInstance';

const ChatInterface = () => {
    const { id } = useParams(); // Receiver's ID from the URL
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState('');
    const chatContainerRef = useRef(null);
    const { socket } = useSocket();

    // Fetch conversation history
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axiosInstance.post(
                    `/chat/getconversationhistory`,
                    { receiverId: id },
                    { withCredentials: true }
                );

                console.log('Conversation History Response:', response.data);

                const messageData = response.data.data || [];

                // Format fetched messages
                const formattedMessages = messageData.map((msg) => ({
                    text: msg.encryptedContent,
                    timestamp: new Date(msg.createdAt),
                    isSent: msg.receiver === id, // Sent if `receiver` matches `id`
                }));

                setMessages(formattedMessages);
            } catch (err) {
                console.error('Error fetching conversation history:', err);
                setError(
                    err.response?.data?.message ||
                        'Failed to load conversation. Please try again.'
                );
            }
        };

        fetchMessages();
    }, [id]);

    useEffect(() => {
        if (socket) {
            const handleMessageReceive = ({ message, to, timestamp }) => {
                console.log('Received message:', message, 'To:', to);

                setMessages((prev) => [
                    ...prev,
                    {
                        text: message,
                        timestamp: new Date(timestamp),
                        isSent: to === id,
                    },
                ]);

                scrollToBottom();
            };

            socket.on('receive-message', handleMessageReceive);

            return () => socket.off('receive-message', handleMessageReceive);
        }
    }, [id, socket]);

    const scrollToBottom = () => {
        chatContainerRef.current?.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'smooth',
        });
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !socket) return;

        const messageData = { message: newMessage.trim(), to: id };

        try {
            socket.emit('send-message', messageData);

            setMessages((prev) => [
                ...prev,
                {
                    text: newMessage.trim(),
                    timestamp: new Date(),
                    isSent: true,
                },
            ]);

            setNewMessage('');
            scrollToBottom();
        } catch (err) {
            console.error('Message failed to send:', err);
            setError('Failed to send message. Please try again.');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(
            () => console.log('Text copied to clipboard'),
            (err) => console.error('Failed to copy text:', err)
        );
    };

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        Chat with User {id}
                    </h2>
                </div>
                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
                        <span>{error}</span>
                    </div>
                )}
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
                                        message.isSent
                                            ? 'justify-end'
                                            : 'justify-start'
                                    }`}
                                >
                                    <div
                                        className={`p-3 rounded-lg text-sm shadow-md ${
                                            message.isSent
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
                                            {message.timestamp.toLocaleTimeString()}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 p-3 rounded-lg bg-gray-800 text-white focus:ring focus:ring-blue-500"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
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
