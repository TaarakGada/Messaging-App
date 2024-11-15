import { ApiError } from '../utils/APIError';
import { asyncHandler } from '../utils/asynchandler';
import { Message } from '../models/message.model';
import { ApiResponse } from '../utils/APIResponse';
import { User } from '../models/user.model';
import { uploadOnCloudinary } from '../utils/cloudinary';

const getConversationHistory = asyncHandler(async (req, res) => {
    const { userId } = req.user?._id;
    const { receiverId } = req.params;

    if (!userId) {
        throw new ApiError(400, 'User ID not found.');
    }

    if (!receiverId) {
        throw new ApiError(400, 'Receiver ID not found.');
    }

    const messages = await Message.find({
        $or: [
            { sender: userId, receiver: receiverId },
            { sender: receiverId, receiver: userId },
        ],
    })
        .populate('sender', 'name')
        .populate('receiver', 'name')
        .sort({ createdAt: 1 });

    return res.status(200).json(
        new ApiResponse({
            status: 200,
            message: 'Conversation history',
            data: messages,
        })
    );
});

const sendMessage = asyncHandler(async (req, res) => {
    const { receiverId, message } = req.body;
    const { userId } = req.user?._id;

    if (!userId) {
        throw new ApiError(400, 'User ID not found.');
    }

    if (!receiverId) {
        throw new ApiError(400, 'Receiver ID not found.');
    }

    if (!message) {
        throw new ApiError(400, 'Message is required.');
    }

    const newMessage = new Message({
        sender: userId,
        receiver: receiverId,
        encryptedContent: message,
        conversationId: `${userId}-${receiverId}`,
    });

    await newMessage.save();

    return res.status(200).json(
        new ApiResponse({
            status: 200,
            message: 'Message sent successfully.',
            data: newMessage,
        })
    );
});
