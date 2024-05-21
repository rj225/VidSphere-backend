import { Video } from '../models/video.models.js';
import { View } from '../models/view.models.js';
import apiError from '../utils/apiError.js';
import apiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { isValidObjectId } from 'mongoose';

const increaseVideoView = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id; // Assuming the user is logged in

    // Check if videoId is valid
    if (!isValidObjectId(videoId)) {
        throw new apiError(400, 'Invalid video ID');
    }

    // Check if the user has viewed the video before
    let existingView = await View.findOne({ video: videoId, user: userId });

    // If the user has not viewed the video before or if it has been more than 10 days since their last view
    if (!existingView || (existingView && isMoreThanTenDays(existingView.timestamp))) {
        // If the view exists but it's been more than 10 days, update the existing view timestamp
        if (existingView) {
            existingView.timestamp = new Date();
            await existingView.save();
        } else {
            // Otherwise, create a new view record
            existingView = await View.create({ video: videoId, user: userId });
        }

        // Increment the view count for the given video ID directly in the Video model
        await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });

        // Return success response
        return res.status(200).json(new apiResponse(200, {}, 'View counted successfully'));
    } else {
        throw new apiError(400, 'You have already viewed this video or it has been less than 10 days since your last view.');
    }
});

// Helper function to check if it's been more than 10 days since the last view
function isMoreThanTenDays(timestamp) {
    const TEN_DAYS_IN_MS = 10 * 24 * 60 * 60 * 1000; // 10 days in milliseconds
    const currentTime = Date.now();
    return currentTime - timestamp.getTime() > TEN_DAYS_IN_MS;
}

export { increaseVideoView };
