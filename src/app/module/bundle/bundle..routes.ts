import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { BundleController } from "./bundle..controller";
import { checkPlanAccess } from "../../middlewares/checkPlanAccess";

const router = express.Router();

router.post(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  BundleController.createBundle
);

router.get("/", BundleController.getAllBundles);
router.get(
  "/public/:id",
  BundleController.getBundleByIdPublic
);
router.get(
  "/:id",
  checkAuth(Role.USER),
  checkPlanAccess("BUNDLE"),
  BundleController.getSingleBundle
);
router.post(
  "/checkout",
  checkAuth(Role.USER),
  BundleController.createCheckout
);

export const BundleRoutes = router;