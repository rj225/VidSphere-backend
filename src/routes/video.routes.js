import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { deleteVideo, getAllVideos, getVideoById, publishVideo, togglePublishStatus, getUserVideos, updateVideoDetails } from "../controllers/video.controller.js";


const router=Router()

router.route("/publish-video").post(verifyJWT,
    upload.fields([
        {
            name:"videoFile",
            maxCount:1
        },
        {
            name:"thumbnail",
            maxCount:1
        }
    ]),
    publishVideo
)

router.route("/get-user-videos").get(getUserVideos)
router.route("/get-all-videos").get(getAllVideos)
// router.route("/:videoId").get(verifyJWT,getVideoById)
router.route("/:videoId").get(getVideoById)
router.route("/update-video/:videoId").patch(verifyJWT,upload.single("thumbnail"), updateVideoDetails)
router.route("/delete-video/:videoId").delete(verifyJWT,deleteVideo)
router.route("/toggle-publish-status/:videoId").patch(verifyJWT,togglePublishStatus)



export default router