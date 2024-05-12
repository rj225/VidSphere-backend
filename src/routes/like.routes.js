import { Router } from 'express';
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
    getLikedComments,
} from "../controllers/like.controller.js"
import {verifyJWT} from "../middlewares/auth.middlewares.js"

const router = Router();
// router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/toggle/v/:videoId").post(verifyJWT , toggleVideoLike);
router.route("/toggle/c/:commentId").post(verifyJWT , toggleCommentLike);
router.route("/toggle/t/:tweetId").post(verifyJWT , toggleTweetLike);
router.route("/videos").get(verifyJWT , getLikedVideos); // here we need to login , by logging in we will get the user._id in backend , then we will fetch the videos liked by the user
router.route("/comments").get(verifyJWT ,getLikedComments); // it is similar as above route, here just we will get the liked comments by user.

export default router