import express from "express";
import { PaymentController } from "./payment.controller";

const router = express.Router();

router.get("/verify-session", PaymentController.verifySession);
router.post("/verify-session", PaymentController.verifySession);

export const PaymentRoutes = router;

