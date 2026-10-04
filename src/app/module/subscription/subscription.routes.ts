
import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { SubscriptionController } from "./subscription.controller";

const router = Router();

router.post("/checkout", checkAuth(Role.USER), SubscriptionController.createCheckoutSession);
router.get(
  "/me",
  checkAuth(Role.USER),
  SubscriptionController.getMySubscription
);

// admin - all subscriptions
router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  SubscriptionController.getAllSubscriptions
);

// single subscription
router.get(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  SubscriptionController.getSingleSubscription
);
export const SubscriptionRoutes = router;