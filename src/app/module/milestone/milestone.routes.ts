import express from "express";
import { MilestoneController } from "./milestone.controller";
import {
  createMilestoneZodSchema,
  updateMilestoneZodSchema,
} from "./milestone.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middlewares/validateRequest";

const router = express.Router();

router.post(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(createMilestoneZodSchema),
  MilestoneController.createMilestone
);

router.get(
  "/course/:courseId",
  checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
  MilestoneController.getMilestonesByCourse
);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateMilestoneZodSchema),
  MilestoneController.updateMilestone
);

router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  MilestoneController.deleteMilestone
);

export const MilestoneRoutes = router;