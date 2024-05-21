import mongoose, { Schema } from "mongoose";

const viewSchema = new Schema({
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

export const View = mongoose.model("View", viewSchema);
