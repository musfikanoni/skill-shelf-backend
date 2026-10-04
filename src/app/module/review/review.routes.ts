import express from "express";
import { ReviewController } from "./review.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = express.Router();

router.post(
    "/", 
    checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
    ReviewController.createReview);
router.get(
  "/",
  ReviewController.getReviews
);
router.get(
  "/can-review",
  checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
  ReviewController.canReview
);
router.patch(
    "/:id",
    checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
    ReviewController.updateReview);

router.delete(
    "/:id",
    checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
    ReviewController.deleteReview);

export const ReviewRoutes = router;