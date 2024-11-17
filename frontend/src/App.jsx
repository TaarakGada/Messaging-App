// src/App.jsx
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

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            const accessToken = Cookies.get('accessToken');
            const hasToken = Boolean(accessToken);
            setIsAuthenticated(hasToken);
            setIsLoading(false);
        };
        checkAuth();
    }, []);

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
            <div className="min-h-screen bg-gray-900">
                <Routes>
                    {/* Public Routes */}
                    <Route
                        path="/login"
                        element={
                            isAuthenticated ? (
                                <Navigate
                                    to="/chat"
                                    replace
                                />
                            ) : (
                                <Login />
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
                                <Signup />
                            )
                        }
                    />

                    {/* Protected Routes */}
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

                    {/* Redirect root to login or chat based on auth status */}
                    <Route
                        path="/"
                        element={
                            <Navigate
                                to={isAuthenticated ? '/chat' : '/login'}
                                replace
                            />
                        }
                    />

                    {/* Catch all route - redirect to login or chat */}
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
        </Router>
    );
};

export default App;
