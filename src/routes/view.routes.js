import { Router } from "express";
import { increaseVideoView } from "../controllers/view.controller.js"; // Import the view controller
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// Route to increase video view
router.route("/:videoId/view").post(verifyJWT , increaseVideoView);

export default router;
