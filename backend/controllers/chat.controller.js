import { ApiError } from '../utils/APIError';
import { asyncHandler } from '../utils/asynchandler';
import { Message } from '../models/message.model';
import { ApiResponse } from '../utils/APIResponse';
import crypto from 'crypto';
import { User } from '../models/user.model';

const getConversationHistory = asyncHandler(async (req, res) => {
    const { userId } = req.user?._id;
    const { receiverId } = req.params;

    if (!userId) {
        throw new ApiError(400, 'User ID not found.');
    }

    if (!receiverId) {
        throw new ApiError(400, 'Receiver ID not found.');
    }

    const ids = [userId, receiverId].sort();
    const concatenatedIds = ids.join('_');

    const conversationId = crypto
        .createHash('sha256')
        .update(concatenatedIds)
        .digest('hex');

    const messages = await Message.find({
        conversationId,
    }).sort({ createdAt: 1 });

    return res.status(200).json(
        new ApiResponse({
            status: 200,
            message: 'Conversation history',
            data: messages,
        })
    );
});

const getOnlineUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ isOnline: true }).select('name email');

    return res.status(200).json(
        new ApiResponse({
            status: 200,
            message: 'Online users',
            data: users,
        })
    );
});

export { getConversationHistory, getOnlineUsers };
