import mongoose, { Schema } from 'mongoose';

const messageSchema = new Schema(
    {
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        receiver: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        encryptedContent: {
            type: String,
            required: false,
        },
        media: {
            type: [
                {
                    url: { type: String, required: true },
                    type: {
                        type: String,
                        enum: ['image', 'video', 'file'],
                        required: true,
                    },
                },
            ],
            required: false,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        conversationId: {
            type: String,
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export const Message = mongoose.model('Message', messageSchema);
