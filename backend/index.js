import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectToDB } from './utils/dbConnect.js';
import dotenv from 'dotenv';
import authRouter from './routes/auth.routes.js';
import { Server } from 'socket.io';
import { createServer } from 'http';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Message } from './models/message.model.js';
import { User } from './models/user.model.js'; // Assuming you have a User model
import chatRouter from './routes/chat.routes.js';

dotenv.config({ path: '.env' });

const app = express();
const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: [
            'https://messaging-app-taarak.netlify.app',
            'http://localhost:5173',
        ],
        methods: ['GET', 'POST'],
        credentials: true,
        allowedHeaders: [
            'Authorization',
            'Cookie',
            'Content-Type',
            'x-requested-with',
        ],
    },
});

const userSocketMap = new Map();

io.use((socket, next) => {
    try {
        // Check multiple ways to get the token
        let token =
            socket.handshake.auth.token ||
            socket.handshake.headers.authorization?.split(' ')[1] ||
            socket.handshake.headers.cookie
                ?.split('; ')
                .find((row) => row.startsWith('accessToken='))
                ?.split('=')[1];

        if (!token) {
            console.error(
                'Complete socket handshake headers:',
                socket.handshake.headers
            );
            console.error(
                'Complete socket handshake auth:',
                socket.handshake.auth
            );
            return next(new Error('No token provided'));
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                console.error('JWT Verification Error:', err);
                return next(new Error('Authentication error'));
            }

            console.log('Decoded JWT:', decoded);
            socket.userId = decoded._id;
            next();
        });
    } catch (error) {
        console.error('Socket Authentication Middleware Error:', error);
        next(new Error('Authentication process failed'));
    }
});

io.on('connection', async (socket) => {
    userSocketMap.set(socket.id, socket.userId);
    console.log(
        `User connected: ${socket.userId} with socket ID: ${socket.id}`
    );

    await User.findByIdAndUpdate(socket.userId, { status: 'Online' });
    socket.broadcast.emit('user-status-changed', {
        userId: socket.userId,
        isOnline: true,
    });

    socket.on('send-message', async ({ message, to, media }) => {
        try {
            if (!socket.userId) {
                console.error('Socket userId is not defined');
                return; // Make sure userId is available
            }
            const ids = [socket.userId, to].sort();
            const concatenatedIds = ids.join('_');

            const conversationId = crypto
                .createHash('sha256')
                .update(concatenatedIds)
                .digest('hex');

            const newMessage = new Message({
                sender: socket.userId, // This should be set correctly now
                receiver: to,
                encryptedContent: message,
                media: media || [],
                conversationId: conversationId,
            });

            await newMessage.save();
            const receiverSocketId = Array.from(userSocketMap.entries()).find(
                ([id, userId]) => userId === to
            )?.[0];

            if (receiverSocketId) {
                socket.to(receiverSocketId).emit('receive-message', {
                    message,
                    from: socket.userId,
                    timestamp: new Date().toISOString(),
                });
            } else {
                console.log(`User with ID ${to} is not connected.`);
            }
        } catch (error) {
            console.error('Error saving message:', error);
            socket.emit('error', { message: 'Failed to send message.' });
        }
    });

    socket.on('disconnect', async () => {
        userSocketMap.delete(socket.id);
        setTimeout(async () => {
            if (![...userSocketMap.values()].includes(socket.userId)) {
                await User.findByIdAndUpdate(socket.userId, {
                    isOnline: false,
                });
                socket.broadcast.emit('user-status-changed', {
                    userId: socket.userId,
                    isOnline: false,
                });
            }
        }, 5000);
    });
});

connectToDB()
    .then(() => {
        server.listen(process.env.PORT || 7000, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    })
    .catch((error) => console.error(error));

app.use(
    cors({
        origin: [
            'https://messaging-app-taarak.netlify.app',
            'http://localhost:5173',
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
        exposedHeaders: ['set-cookie'],
    })
);

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/chat', chatRouter);
