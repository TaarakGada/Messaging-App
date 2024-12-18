import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Chat from './pages/Chat';
import ChatInterface from './pages/ChatInterface';
import Cookies from 'js-cookie';
import { SocketProvider } from './context/SocketContext';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            const accessToken =
                localStorage.getItem('accessToken') ||
                Cookies.get('accessToken');
            setIsAuthenticated(!!accessToken);
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-900">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    const ProtectedRoute = ({ children }) => {
        if (!isAuthenticated) {
            return (
                <Navigate
                    to="/login"
                    replace
                />
            );
        }
        return children;
    };

    return (
        <Router>
            <SocketProvider>
                <div className="min-h-screen bg-gray-900">
                    <Routes>
                        <Route
                            path="/login"
                            element={
                                isAuthenticated ? (
                                    <Navigate
                                        to="/chat"
                                        replace
                                    />
                                ) : (
                                    <Login
                                        onLoginSuccess={handleLoginSuccess}
                                    />
                                )
                            }
                        />
                        <Route
                            path="/signup"
                            element={
                                isAuthenticated ? (
                                    <Navigate
                                        to="/chat"
                                        replace
                                    />
                                ) : (
                                    <Signup
                                        onSignupSuccess={handleLoginSuccess}
                                    />
                                )
                            }
                        />
                        <Route
                            path="/chat"
                            element={
                                <ProtectedRoute>
                                    <Chat />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/chat/:id"
                            element={
                                <ProtectedRoute>
                                    <ChatInterface />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/"
                            element={
                                <Navigate
                                    to={isAuthenticated ? '/chat' : '/login'}
                                    replace
                                />
                            }
                        />
                        <Route
                            path="*"
                            element={
                                <Navigate
                                    to={isAuthenticated ? '/chat' : '/login'}
                                    replace
                                />
                            }
                        />
                    </Routes>
                </div>
            </SocketProvider>
        </Router>
    );
};

export default App;
