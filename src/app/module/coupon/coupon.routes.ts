import express from "express";
import { CouponController } from "./coupon.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = express.Router();

router.post(
    "/", 
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    CouponController.createCoupon);
router.get(
    "/", 
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    CouponController.getAllCoupons);
router.get(
    "/:id", 
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    CouponController.getSingleCoupon);
router.patch(
    "/:id", 
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    CouponController.updateCoupon);
router.delete(
    "/:id", 
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    CouponController.deleteCoupon);

export const CouponRoutes = router;