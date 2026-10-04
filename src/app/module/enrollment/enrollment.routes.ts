import express from "express";
import { EnrollmentController } from "./enrollment.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = express.Router();

router.post(
  "/checkout",
  checkAuth(Role.USER),
  EnrollmentController.createCheckoutSession
);

router.get(
  "/",
  checkAuth(Role.ADMIN),
  EnrollmentController.getAllEnrollments
);

router.get(
  "/my-enrollments",
  checkAuth(Role.USER, Role.ADMIN),
  EnrollmentController.getMyEnrollments
);

router.get(
  "/:id",
  checkAuth(Role.ADMIN),
  EnrollmentController.getSingleEnrollment
);

export const EnrollmentRoutes = router;