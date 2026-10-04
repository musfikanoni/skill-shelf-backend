import express from "express";
import { OrderController } from "./order.controller";
import { createOrderValidation } from "./order.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middlewares/validateRequest";

const router = express.Router();

router.post(
  "/checkout",
  checkAuth(Role.USER), // protect route
  validateRequest(createOrderValidation),
  OrderController.createCheckout
);

router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  OrderController.getAllOrders
);

router.get(
  "/my-orders",
  checkAuth(Role.USER, Role.ADMIN),
  OrderController.getMyOrders
);

router.get(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER),
  OrderController.getSingleOrder
);



export const OrderRoutes = router;