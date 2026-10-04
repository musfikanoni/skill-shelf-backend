import { Types } from "mongoose";
import { Review } from "./review.model";
import { Product } from "../product/product.model";
import { Course } from "../courses/courses.model";
import { Order } from "../order/order.model";
import { Enrollment } from "../enrollment/enrollment.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { IPlan } from "../plan/plan.interface";
import { Subscription } from "../subscription/subscription.model";


const calculateRating = async (itemId: string, itemType: string) => {
  const stats = await Review.aggregate([
    {
      $match: {
        itemId: new Types.ObjectId(itemId),
        itemType,
      },
    },
    {
      $group: {
        _id: "$itemId",
        avgRating: { $avg: "$rating" },
        total: { $sum: 1 },
      },
    },
  ]);

  const updateData = {
    averageRating: stats.length
      ? Number(stats[0].avgRating.toFixed(1))
      : 0,
    totalReviews: stats.length ? stats[0].total : 0,
  };


  if (itemType === "product") {
    await Product.findByIdAndUpdate(itemId, updateData);
  }


  if (itemType === "course") {
    await Course.findByIdAndUpdate(itemId, updateData);
  }
};

// const checkUserPurchased = async (
//   userId: string,
//   itemId: string,
//   itemType: string
// ) => {

//   // =========================
//   // 1️⃣ PRODUCT CHECK
//   // =========================
//   if (itemType === "product") {

//     // 🔥 direct purchase
//     const order = await Order.findOne({
//       user: userId,
//       product: itemId,
//       status: "PAID",
//     });

//     if (order) return true;

//     // 🔥 subscription access
//     const subscription = await Subscription.findOne({
//       user: userId,
//       status: "ACTIVE",
//     }).populate<{ plan: IPlan }>("plan");

//     const hasAccess = subscription?.plan?.access?.products?.some(
//       (p: any) => p.product.toString() === itemId
//     );

//     if (hasAccess) return true;

//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       "You must purchase this product to review it"
//     );
//   }

//   // =========================
//   // 2️⃣ COURSE CHECK
//   // =========================
//   if (itemType === "course") {

//     const purchase = await Enrollment.findOne({
//       user: userId,
//       course: itemId,
//       status: "PAID",
//     });

//     if (purchase) return true;

//     const subscription = await Subscription.findOne({
//       user: userId,
//       status: "ACTIVE",
//     }).populate<{ plan: IPlan }>("plan");

//     const hasAccess = subscription?.plan?.access?.courses?.some(
//       (c: any) => c.toString() === itemId
//     );

//     if (hasAccess) return true;

//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       "You must purchase this course to review it"
//     );
//   }

//   return false;
// };


const checkUserPurchased = async (
  userId: string,
  itemId: string,
  itemType: string
) => {

  // =========================
  // PRODUCT CHECK
  // =========================
  if (itemType === "product") {


    const order = await Order.findOne({
      user: userId,
      product: itemId,
      status: "PAID",
    });

    if (order) return true;

    const subscription = await Subscription.findOne({
      user: userId,
      status: "ACTIVE",
    }).populate<{ plan: IPlan }>("plan");

    const products = subscription?.plan?.access?.products || [];

    const hasAccess = products.some((p: any) =>
      (p?.product || p)?.toString() === itemId
    );

    if (hasAccess) return true;

    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You must purchase or have subscription access to review this product"
    );
  }

  // =========================
  // COURSE CHECK
  // =========================
  if (itemType === "course") {


    const purchase = await Enrollment.findOne({
      user: userId,
      course: itemId,
      status: "PAID",
    });

    if (purchase) return true;

 
    const subscription = await Subscription.findOne({
      user: userId,
      status: "ACTIVE",
    }).populate<{ plan: IPlan }>("plan");

    const courses = subscription?.plan?.access?.courses || [];

    const hasAccess = courses.some((c: any) =>
      (c?.course || c)?.toString() === itemId
    );

    if (hasAccess) return true;

    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You must purchase or have subscription access to review this course"
    );
  }

  return false;
};
const createReview = async (payload: any, userId: string) => {

  await checkUserPurchased(userId, payload.itemId, payload.itemType);

  const alreadyReviewed = await Review.findOne({
    user: userId,
    itemId: payload.itemId,
    itemType: payload.itemType,
  });

  if (alreadyReviewed) {
    throw new AppError(httpStatus.BAD_REQUEST, "You already reviewed this item");
  }

  const review = await Review.create({
    ...payload,
    user: userId,
  });

  await calculateRating(payload.itemId, payload.itemType);

  return review;
};

const getReviews = async (query: Record<string, string>) => {
  const { itemId, itemType } = query;

  const filter: any = {};

  if (itemId) filter.itemId = itemId;
  if (itemType) filter.itemType = itemType;

  const reviews = await Review.find(filter)
    .populate("user", "name email picture") 
    .sort({ createdAt: -1 })
    .lean();

  return reviews;
};

const updateReview = async (id: string, payload: any) => {
  const review = await Review.findByIdAndUpdate(id, payload, {
    new: true,
  });

  if (review) {
    await calculateRating(
      review.itemId.toString(),   
      review.itemType            
    );
  }

  return review;
};

const deleteReview = async (id: string) => {
  const review = await Review.findByIdAndDelete(id);

  if (review) {
    await calculateRating(
      review.itemId.toString(),   
      review.itemType             
    );
  }

  return review;
};
const canReview = async (
  userId: string,
  itemId: string,
  itemType: "product" | "course"
) => {


  const existing = await Review.findOne({
    user: userId,
    itemId,
    itemType,
  });

  if (existing) {
    return false;
  }

  await checkUserPurchased(userId, itemId, itemType);

  return true;
};
export const ReviewService = {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
  canReview
};