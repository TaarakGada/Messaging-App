import { ApiError } from '../utils/APIError.js';
import { asyncHandler } from '../utils/asynchandler.js';
import { Message } from '../models/message.model.js';
import { ApiResponse } from '../utils/APIResponse.js';
import crypto from 'crypto';
import { User } from '../models/user.model.js';

const getConversationHistory = async (req, res) => {
    try {
        const { receiverId } = req.body;
        if (!receiverId) {
            return res.status(400).json({ message: 'receiverId is required.' });
        }

        const conversation = await Message.find({
            $or: [
                { sender: req.userId, receiver: receiverId },
                { sender: receiverId, receiver: req.userId },
            ],
        }).sort({ createdAt: 1 });

        res.status(200).json(
            new ApiResponse(200, 'Conversation history', conversation)
        );
    } catch (error) {
        console.error('Error fetching conversation history:', error);
        res.status(500).json({ message: 'Server error occurred.' });
    }
};

const getOnlineUsers = asyncHandler(async (req, res) => {
    const { _id: userId } = req.user;
    const users = await User.find({
        status: 'Online',
        _id: { $ne: userId },
    }).select('username avatar _id');

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                'Online users excluding the current user',
                users
            )
        );
});

export { getConversationHistory, getOnlineUsers };
