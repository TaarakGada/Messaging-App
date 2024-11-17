import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avatar: {
            type: String,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
        },
        refreshToken: {
            type: String,
        },
        publicKey: {
            type: String, // Optional initially, set during `pre('save')`
        },
        privateKey: {
            type: String, // Optional initially, set during `pre('save')`
        },
        friends: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        status: {
            type: String,
            default: 'Offline',
        },
    },
    { timestamps: true }
);

// Single `pre('save')` hook to handle both password hashing and key generation
userSchema.pre('save', async function (next) {
    try {
        // Hash the password if it has been modified
        if (this.isModified('password')) {
            this.password = await bcrypt.hash(this.password, 10);
        }

        // Generate public/private key pair if this is a new user
        if (this.isNew) {
            const { publicKey, privateKey } = crypto.generateKeyPairSync(
                'rsa',
                {
                    modulusLength: 2048,
                    publicKeyEncoding: { type: 'spki', format: 'pem' },
                    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
                }
            );
            this.publicKey = publicKey;
            this.privateKey = privateKey; // Ensure this is stored securely
        }

        next();
    } catch (error) {
        next(error); // Pass any error to Mongoose
    }
});

// Check if the provided password matches the hashed password
userSchema.methods.isPasswordCorrect = async function (password) {
    return bcrypt.compare(password, this.password);
};

// Generate JWT access token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

// Generate JWT refresh token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export const User = mongoose.model('User', userSchema);
