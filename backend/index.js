import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectToDB } from './utils/dbConnect.js';
import dotenv from 'dotenv';
import authRouter from './routes/auth.routes.js';
import { Server } from 'socket.io';
import { createServer } from 'http';
import crypto from 'crypto';
import { Message } from './models/message.model.js';

dotenv.config({
    path: '.env',
});

const app = express();

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        methods: ['GET', 'POST'],
    },
});

const userSocketMap = new Map();

io.use((socket, next) => {
    const token = socket.handshake.query.token;
    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return next(new Error('Authentication error'));
            }
            socket.userId = decoded.userId;
            next();
        });
    } else {
        next(new Error('No token provided'));
    }
});

io.on('connection', async (socket) => {
    userSocketMap.set(socket.id, socket.userId);
    console.log(
        `User  connected: ${socket.userId} with socket ID: ${socket.id}`
    );

    await User.findByIdAndUpdate(userId, { isOnline: true });
    socket.broadcast.emit('user-status-changed', {
        userID: socket.userId,
        isOnline: true,
    });

    socket.on('send-message', async ({ message, to, media }) => {
        try {
            const ids = [socket.userId, to].sort();
            const concatenatedIds = ids.join('_');

            conversationId = crypto
                .createHash('sha256')
                .update(concatenatedIds)
                .digest('hex');

            const newMessage = new Message({
                sender: socket.userId,
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
                });
            } else {
                console.log(`User  with ID ${to} is not connected.`);
            }
        } catch (error) {
            console.error('Error saving message:', error);
            socket.emit('error', { message: 'Failed to send message.' });
        }
    });

    socket.on('disconnect', async () => {
        userSocketMap.delete(socket.id);
        await User.findByIdAndUpdate(userId, {
            isOnline: false,
        });
        console.log(
            `User  disconnected: ${socket.userId} with socket ID: ${socket.id}`
        );
        socket.broadcast.emit('user-status-changed', {
            userId: socket.userId,
            isOnline: false,
        });
    });
});

connectToDB()
    .then(() => {
        app.listen(process.env.PORT || 7000, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    })
    .catch((error) => console.error(error));

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(
    express.json({
        limit: '16kb',
    })
);

app.use(
    express.urlencoded({
        extended: true,
    })
);

app.use(express.static('public'));

app.use(cookieParser());

app.use('/api/v1/auth', authRouter);
