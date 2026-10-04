
import AppError from "../errorHelpers/AppError";
import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Payment } from "../module/payment/payment.model";

export const checkPlanAccess = (type: "PRODUCT" | "COURSE" | "BUNDLE") => {
  return async (req:Request, res:Response, next:NextFunction) => {
    const user = req.user as JwtPayload;
    const userId = user.userId;

    const subscription = await Payment.findOne({ user: userId })
      .populate("plan");

    if (!subscription) {
      throw new AppError(403, "No subscription found");
    }

    const plan: any = subscription.planType;

    const allowed =
      plan?.access?.[type.toLowerCase() + "s"] || [];

    req.allowedItems = allowed;

    next();
  };
};