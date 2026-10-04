import express from "express";
import { VideoController } from "./video.controller";
import { createVideoZodSchema } from "./video.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { upload } from "../../config/S3Client.config";
import { validateRequest } from "../../middlewares/validateRequest";

const router = express.Router();

// ADMIN upload video
router.post(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  upload({
    folder: "courses",
    fileType: "video",
    maxCount: 1,
  }),
  validateRequest(createVideoZodSchema),
  VideoController.createVideo
);

// SECURE streaming
router.get(
  "/:id/stream",
  checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
  VideoController.getSecureVideo
);
router.patch(
  "/:id/publish",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  VideoController.publishVideo
);
router.get(
  "/milestone/:milestoneId",
  checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
  VideoController.getVideosByMilestone
);
router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  VideoController.deleteVideo
);
export const VideoRoutes = router;