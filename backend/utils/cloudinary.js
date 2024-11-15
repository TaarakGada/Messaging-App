import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localfilepath) => {
    try {
        // console.log(localfilepath);
        if (!localfilepath) return null;
        const response = await cloudinary.uploader.upload(localfilepath, {
            resource_type: "auto",
        });
        console.log("File uploaded successfully on Cloudinary.");
        // console.log(response.url);
        // console.log(localfilepath);
        fs.unlinkSync(localfilepath); //remove the locally saved temp file
        return response;
    } catch (error) {
        // fs.unlinkSync(localfilepath); //remove the locally saved temp file
        console.error("Error while uploading file on Cloudinary: ", error);
        return null;
    }
};

export { uploadOnCloudinary };
