import mongoose from 'mongoose';

const DB_NAME = 'MessagingApp';

export const connectToDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(
            `\nMongoDB connected !! DB Host: ${mongoose.connection.host}`
        );
    } catch (error) {
        console.log('Error connecting to MongoDB');
        console.error(error);
        process.exit(1);
    }
};

export default connectToDB;
