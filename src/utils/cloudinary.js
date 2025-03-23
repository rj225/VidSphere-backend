import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// Cloudinary Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Function to upload file from buffer (for memory storage)
const uploadOnCloudinary = async (buffer, folder = "uploads", resourceType = "auto") => {
    try {
        if (!buffer) return null;

        console.log(`Uploading to Cloudinary: Folder - ${folder}, Resource Type - ${resourceType}`); // Debugging log

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { 
                    resource_type: resourceType,  // ✅ Explicit resource type
                    folder 
                },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary Upload Error:", error); // Log error
                        return reject(error);
                    }
                    resolve(result);
                }
            );
            streamifier.createReadStream(buffer).pipe(uploadStream);
        });
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        return null;
    }
};

export default uploadOnCloudinary;

