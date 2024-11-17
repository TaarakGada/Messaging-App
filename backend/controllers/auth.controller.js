import { asyncHandler } from '../utils/asynchandler.js';
import { ApiError } from '../utils/APIError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/APIResponse.js';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error(error);
        throw new ApiError(
            500,
            'Something went wrong while generating tokens.'
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, username, password } = req.body;
    if (
        [fullname, email, username, password].some(
            (field) => field?.trim() === ''
        )
    ) {
        throw new ApiError(400, 'All fields are required');
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, 'User already exists');
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log(avatarLocalPath);

    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar image is required');
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    const user = await User.create({
        fullname,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar?.url || '',
    });

    const createdUser = await User.findById(user._id).select(
        '-password -refreshToken'
    );

    if (!createdUser) {
        throw new ApiError(500, 'User not created');
    }

    return res
        .status(201)
        .json(new ApiResponse(200, createdUser, 'User created'));
});

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!(username || email)) {
        throw new ApiError(400, 'Username or email is required');
    }

    const user = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    const passwordMatch = await user.isPasswordCorrect(password);

    if (!passwordMatch) {
        throw new ApiError(401, 'Invalid User Credentials.');
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user._id
    );

    const loggedinUser = await User.findById(user._id).select(
        ' -password -refreshToken'
    );

    const options = {
        httpOnly: false,
        secure: true,
        sameSite: 'Lax',
        path: '/',
    };

    return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedinUser,
                    accessToken,
                    refreshToken,
                },
                'User logged in successfully.'
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: false,
        secure: true,
        sameSite: 'Lax',
        path: '/',
    };

    res.status(200)
        .clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json(new ApiResponse(200, {}, 'User logged out.'));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, 'Unauthorized request.');
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.ACCESS_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, 'Invalid refresh token.');
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, 'Refresh token is expired or used.');
        }

        const options = {
            httpOnly: false,
            secure: true,
            sameSite: 'Lax',
            path: '/',
        };

        const { accessToken, newrefreshToken } =
            await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie('accessToken', accessToken, options)
            .cookie('refreshToken', newrefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newrefreshToken },
                    'Access token refreshed.'
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || 'Invalid refresh token.');
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400, 'Invalid Password');
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Password Changed Successfully!'));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .statur(200)
        .json(
            new ApiResponse(200, req.user, 'Current user fetched successfully.')
        );
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email, username } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName: fullName?.trim() || req.user?.fullName,
                email: email?.trim() || req.user?.email,
                username: username?.trim() || req.user?.username,
            },
        },
        { new: true }
    ).select('-password');
    return res
        .status(200)
        .json(new ApiResponse(200, user, 'User details successfully updated!'));
});

const updateAvatar = asyncHandler(async (req, res) => {
    const newAvatarFilePath = req.file?.path;
    if (!newAvatarFilePath) {
        throw new ApiError(400, 'Avatar file is missing!');
    }
    const newAvatarURL = await uploadOnCloudinary(newAvatarFilePath);

    if (!newAvatarURL) {
        throw new ApiError(400, 'Error while uploading file on cloudinary!');
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: newAvatarURL.url,
            },
        },
        { new: true }
    ).select('-password');

    return res
        .statur(200)
        .json(new ApiResponse(200, user, 'Avatar successfully updated.'));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
};
