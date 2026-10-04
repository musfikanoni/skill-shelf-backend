
import httpStatus from "http-status-codes";
import AppError from "../errorHelpers/AppError";
import { Subscription } from "../module/subscription/subscription.model";


export const checkAccess = async (
  userId: string,
  type: "PRODUCT" | "COURSE" | "BUNDLE",
  itemId?: string
) => {

  const subscription = await Subscription.findOne({ user: userId })
    .populate("plan");

  if (!subscription || !subscription.plan) {
    throw new AppError(httpStatus.FORBIDDEN, "No active subscription");
  }

  const plan: any = subscription.plan;

  // =========================
  // RULE SYSTEM CHECK
  // =========================
  if (plan.accessRules) {

    if (type === "PRODUCT") {
      if (plan.accessRules.products.type === "ALL") return true;
    }

    if (type === "COURSE") {
      if (plan.accessRules.courses.type === "ALL") return true;
    }

    if (type === "BUNDLE") {
      if (plan.accessRules.bundles.type === "ALL") return true;
    }

    return false;
  }

  // =========================
  //  FALLBACK OLD SYSTEM
  // =========================
  if (type === "PRODUCT") {
    return plan.allowedProducts?.some(
      (id: any) => id.toString() === itemId
    );
  }

  if (type === "COURSE") {
    return plan.allowedCourses?.some(
      (id: any) => id.toString() === itemId
    );
  }

  if (type === "BUNDLE") {
    return plan.allowedBundles?.some(
      (id: any) => id.toString() === itemId
    );
  }

  return false;
};