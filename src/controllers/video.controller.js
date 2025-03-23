import { Video } from "../models/video.models.js";
import { Like } from '../models/like.models.js'; // Adjust the path based on your project structure
import { View } from "../models/view.models.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { User } from "../models/user.models.js";
import mongoose from "mongoose";
import { isValidObjectId } from 'mongoose';

const publishVideo = asyncHandler(async (req, res) => {
    /*
    1. Get title and description
    2. Get video and thumbnail
    3. Upload on Cloudinary
    4. Store in MongoDB
    5. Return response
    */

    console.log("Files received:", req.files);

    // 1️⃣ Get title and description
    const { title, description } = req.body;  
    if (!title) {
        throw new apiError(400, "Title for the video is required");
    }

    // 2️⃣ Ensure video and thumbnail exist
    const videoBuffer = req.files?.videoFile?.[0]?.buffer;
    if (!videoBuffer) {
        throw new apiError(400, "No video found");
    }

    const thumbnailBuffer = req.files?.thumbnail?.[0]?.buffer;
    if (!thumbnailBuffer) {
        throw new apiError(400, "No thumbnail found");
    }

    // 3️⃣ Upload files to Cloudinary
    const videoUpload = await uploadOnCloudinary(videoBuffer, "videos", "video");
    if (!videoUpload?.secure_url) {
        throw new apiError(400, "Video not uploaded to Cloudinary");
    }
    
    const thumbnailUpload = await uploadOnCloudinary(thumbnailBuffer, "thumbnails", "image");
    if (!thumbnailUpload?.secure_url) {
        throw new apiError(400, "Thumbnail not uploaded to Cloudinary");
    }

    console.log("✅ Video and thumbnail uploaded to Cloudinary");

    // 4️⃣ Get user details
    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new apiError(404, "User not found");
    }

    // 5️⃣ Store video details in MongoDB
    const video = await Video.create({
        videoFile: videoUpload.secure_url,  // ✅ Corrected field
        thumbnail: thumbnailUpload.secure_url,  // ✅ Corrected field
        owner: user._id,
        title,
        description: description || "",
        duration: videoUpload.duration || 0,  // ✅ Ensure duration is handled
    });

    // 6️⃣ Return response
    return res.status(200).json(new apiResponse(200, video, "Video uploaded successfully"));
});


const getUserVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, query, sortBy = 'createdAt', sortType = 'desc' } = req.query;
    const { userId } = req.params; // Retrieve the user ID from req.params

    // Check if the provided user ID is valid
    if (!isValidObjectId(userId)) {
        throw new apiError(400, 'Invalid user ID');
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
        throw new apiError(404, 'User not found');
    }

    const matchQuery = { owner: user._id, isPublished: true };
    if (query && typeof query === 'string') {
        matchQuery.$or = [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ];
    }

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    const videos = await Video.aggregate([
        { $match: matchQuery },
        {
            $lookup: {
                from: 'likes',
                localField: '_id',
                foreignField: 'video',
                as: 'likes',
            }
        },
        {
            $addFields: {
                likes: { $size: '$likes' }
            }
        },
        {
            $project: {
                _id: 1,
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                owner: 1,
                createdAt: 1,
                updatedAt: 1,
                likes: 1
            }
        },
        { $sort: { [sortBy]: sortType === 'asc' ? 1 : -1 } },
        { $skip: skip },
        { $limit: pageSize }
    ]);

    if (!videos || videos.length === 0) {
        return res.status(200).json(new apiResponse(200, "No videos available."));
    }

    // Return the videos
    res.status(200).json(new apiResponse(200, videos, "Videos fetched successfully"));
});


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit: queryLimit = 12, query, sortBy = 'createdAt', sortType = 'asc' } = req.query;

    const pageNumber = parseInt(page);
    const limitOfComments = parseInt(queryLimit);  // Rename limit to avoid conflict
    const skip = (pageNumber - 1) * limitOfComments;

    // Build match query for searching
    const matchQuery = {};
    if (query && typeof query === 'string') {
        matchQuery.$or = [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ];
    }

    // Aggregation pipeline
    const aggregationPipeline = [
        {
            $match: {
                ...matchQuery,
                isPublished: true
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            fullname: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: {
                path: "$owner",
                preserveNullAndEmptyArrays: true // Ensure owner is included even if not found
            }
        },
        {
            $project: {
                "_id": 1,
                "videoFile": 1,
                "thumbnail": 1,
                "title": 1,
                "description": 1,
                "duration": 1,
                "views": 1,
                "isPublished": 1,
                "owner": {
                    _id: "$owner._id",
                    fullname: "$owner.fullname",
                    avatar: "$owner.avatar"
                },
                "createdAt": 1,
                "updatedAt": 1,
            }
        },
        { $sort: { [sortBy]: sortType === 'asc' ? 1 : -1 } },
    ];

    try {
        // Use aggregatePaginate
        const options = {
            page: pageNumber,
            limit: limitOfComments
        };

        const result = await Video.aggregatePaginate(Video.aggregate(aggregationPipeline), options);

        const { docs: videos } = result;

        if (videos.length === 0) {
            return res.status(200).json(new apiResponse(200, "No videos available."));
        }

        res.status(200).json(new apiResponse(200, result, "Videos fetched successfully"));
    } catch (error) {
        console.error("Error fetching videos:", error);
        res.status(500).json(new apiResponse(500, "An error occurred while fetching videos."));
    }
});


const getVideoById = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        if (!videoId) {
            throw new apiError(400, "videoId cant be fetched from params");
        }

        const video = await Video.findById(videoId);
        if (!video) {
            throw new apiError(400, "Cant find video");
        }

        // Fetch the likes count for the video
        const likesCount = await Like.countDocuments({ video: videoId });

        // const totalViewsCount = await View.countDocuments({ video: videoId });

        // Include likes count in the response, similar to other controllers
        return res.status(200).json(new apiResponse(200, { ...video.toObject(), likes: likesCount }, "Video fetched successfully"));

    } catch (error) {
        throw new apiError(400, `Internal Error ${error}`);
    }
});



const updateVideoDetails = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new apiError(400, "videoId cant be fetched from params")
    }

    // Only the owner can update the video details
    const video = await Video.findById(videoId)
    if (!video) {
        throw new apiError(404, "Video not found")
    }

    const user = await User.findOne({
        refreshToken: req.cookies.refreshToken,
    })
    if (!user) {
        throw new apiError(404, "User not found")
    }

    if (!video.owner.equals(user._id.toString())) {
        throw new apiError(403, "Only the owner can update video details")
    }

    // Update title, description, and thumbnail if provided
    const { title, description } = req.body
    let thumbnailUpdated = false;

    if (title !== undefined) {
        if (!title) {
            throw new apiError(400, "Title is required")
        }
        video.title = title;
    }

    if (description !== undefined) {
        if (!description) {
            throw new apiError(400, "Description is required")
        }
        video.description = description;
    }

    // Update thumbnail
    if (req.file) {
        const newThumbnailLocalFilePath = req.file.path;
        if (!newThumbnailLocalFilePath) {
            throw new apiError(400, "Thumbnail is not uploaded");
        }
        const thumbnail = await uploadOnCloudinary(newThumbnailLocalFilePath);
        if (!thumbnail) {
            throw new apiError(500, "Failed to upload thumbnail to Cloudinary");
        }
        video.thumbnail = thumbnail.url;
    }    

    // Save the changes
    await video.save();

    // Return the response
    return res
        .status(200)
        .json(new apiResponse(200, video, `Video details ${thumbnailUpdated ? 'and thumbnail ' : ''}updated successfully`))
})



const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new apiError(400, "videoId cant be fetched from params")
    }

    const video = await Video.findById(videoId)
    const user = await User.findOne({
        refreshToken: req.cookies.refreshToken,
    })
    if (!user) {
        throw new apiError(404, "User not found")
    }


    //only the owner can delete the video
    if (video?.owner.equals(user._id.toString())) {
        await Video.findByIdAndDelete(videoId)
        return (
            res
                .status(200)
                .json(new apiResponse(200, {}, "Video deleted successfully"))
        )
    } else {
        throw new apiError(401, "Only user can delete the video")
    }


})


const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new apiError(400, "videoId cant be fetched from params")
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new apiError(404, "Video not found");
    }
    video.isPublished = !video.isPublished;

    await video.save({ validateBeforeSave: false })

    return (
        res
            .status(200)
            .json(new apiResponse(200, video.isPublished, "Video publish toggled successfully"))
    )
})


export {
    publishVideo,
    getUserVideos,
    getAllVideos,
    getVideoById,
    updateVideoDetails,
    deleteVideo,
    togglePublishStatus
}