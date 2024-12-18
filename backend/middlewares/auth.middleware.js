import { User } from '../models/user.model.js';
import { ApiError } from '../utils/APIError.js';
import { asyncHandler } from '../utils/asynchandler.js';
import jwt from 'jsonwebtoken';

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        // Check for token in Authorization header first (sent from localStorage)
        const token =
            req.headers.authorization?.split(' ')[1] ||
            req.cookies?.accessToken;

        if (!token) {
            throw new ApiError(401, 'Unauthorized request');
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select(
            '-password -refreshToken'
        );

        if (!user) {
            throw new ApiError(401, 'Invalid Access token.');
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || 'Invalid access token.');
    }
});
