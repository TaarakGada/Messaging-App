import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
    withCredentials: true,
});

socket.on('connect', () => {
    console.log('Connected to Socket.IO server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from Socket.IO server');
});

export default socket;
