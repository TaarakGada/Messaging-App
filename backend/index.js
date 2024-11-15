import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectToDB } from './utils/dbConnect.js';
import dotenv from 'dotenv';
import authRouter from './routes/auth.routes.js';

//initializing dotenv
dotenv.config({
    path: '.env',
});

const app = express();

connectToDB()
    .then(() => {
        app.listen(process.env.PORT || 7000, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    })
    .catch((error) => console.error(error));

//To Set Cross Origin Resource Sharing to allow requests from any origin
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

//To set the limit of the request body to 16kb
app.use(
    express.json({
        limit: '16kb',
    })
);

//To decode the url encoded data
app.use(
    express.urlencoded({
        extended: true,
    })
);

// To store public assets like images
app.use(express.static('public'));

//To parse the cookies
app.use(cookieParser());

//routes declaration
app.use('/api/v1/auth', authRouter);
