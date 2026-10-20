import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import { createCourseZodSchema, updateCourseZodSchema } from "./courses.validation";
import { FileTypes, upload } from "../../config/cloudinary.config";
import { parseFormDataMiddleware } from "../../middlewares/parseFormDataMiddleware";
import { checkPlanAccess } from "../../middlewares/checkPlanAccess";
import { CourseController } from "./courses.controller";


const router = express.Router();

router.post(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  upload({
    folder: "CourseThumbnail",
    fileType: FileTypes.IMAGE,
    maxCount: 1,
  }),
  parseFormDataMiddleware,
  validateRequest(createCourseZodSchema),
  CourseController.createCourse
);

router.get("/", CourseController.getAllCourses);

router.get(
  "/public/:id",
  CourseController.getSinglePublicCourse
);

router.get(
  "/:id",
  checkAuth(Role.USER),
  checkPlanAccess("COURSE"),
  CourseController.getSingleCourse);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  upload({
    folder: "CourseThumbnail",
    fileType: FileTypes.IMAGE,
    maxCount: 1,
  }),
  parseFormDataMiddleware,
  validateRequest(updateCourseZodSchema),
  CourseController.updateCourse
);

router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), CourseController.deleteCourse);

export const CourseRoutes = router;