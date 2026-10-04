import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { AffiliateController } from "./affiliate.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createAffiliateZodSchema,
  updateAffiliateStatusSchema,
} from "./affiliate.validation";

const router = Router();

router.post(
  "/",
  checkAuth(Role.USER),
  validateRequest(createAffiliateZodSchema),
  AffiliateController.createAffiliate
);

router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  AffiliateController.getAllAffiliates
);

router.get(
  "/my-commissions",
  checkAuth(Role.USER),
  AffiliateController.getMyCommissions
);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateAffiliateStatusSchema),
  AffiliateController.updateCommissionStatus
);

router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  AffiliateController.deleteAffiliate
);

export const AffiliateRoutes = router;