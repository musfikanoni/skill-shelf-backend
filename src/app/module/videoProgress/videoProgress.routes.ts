import express from "express";
import { VideoProgressController } from "./videoProgress.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = express.Router();

/**
 * 📊 Update watch progress
 */
router.post(
  "/update",
  checkAuth(Role.USER),
  VideoProgressController.updateProgress
);

/**
 * ✅ Mark video complete manually
 */
router.post(
  "/complete",
  checkAuth(Role.USER),
  VideoProgressController.markComplete
);

/**
 * 📈 Course progress percentage
 */
router.get(
  "/course/:courseId",
  checkAuth(Role.USER),
  VideoProgressController.getCourseProgress
);

/**
 * ▶ Resume video
 */
router.get(
  "/resume/:videoId",
  checkAuth(Role.USER),
  VideoProgressController.getVideoResume
);

/**
 * ⏭ Get next video
 */
router.get(
  "/next/:courseId",
  checkAuth(Role.USER),
  VideoProgressController.getNextVideo
);

export const VideoProgressRoutes = router;