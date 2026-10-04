import { Bundle } from "./bundle.model";
import { User } from "../user/user.model";
import { stripe } from "../../config/stripe";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { Payment } from "../payment/payment.model";
import { Coupon } from "../coupon/coupon.model";

const createBundle = async (payload: any) => {
  return await Bundle.create(payload);
};

const getAllBundles = async () => {
  return await Bundle.find().populate("products courses");
};

const getSingleBundle = async (id: string) => {
  if (!id) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid bundle id");
  }

  const bundle = await Bundle.findById(id)
    .populate("products")
    .populate("courses");

  if (!bundle) {
    throw new AppError(httpStatus.NOT_FOUND, "Bundle not found");
  }

  return bundle;
};

const getBundleByIdPublic = async (id: string) => {
  if (!id) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid bundle id");
  }

  const bundle = await Bundle.findOne({
    _id: id,
    isActive: true
  })
    .populate({
      path: "products",
      select: "-files" // ❌ remove files
    })
    .populate({
      path: "courses",
      select: "-files" // ❌ if course has files/videos
    });

  if (!bundle) {
    throw new AppError(httpStatus.NOT_FOUND, "Bundle not found");
  }

  return bundle;
};

const updateBundle = async (id: string, payload: any) => {
  return await Bundle.findByIdAndUpdate(id, payload, {
    returnDocument: "after"
  });
};

const deleteBundle = async (id: string) => {
  return await Bundle.findByIdAndDelete(id);
};

/* ================================
   🔥 CHECKOUT WITH COUPON
================================ */

const createBundleCheckout = async (
  userId: string,
  bundleId: string,
  couponCode?: string
) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  const bundle = await Bundle.findById(bundleId);
  if (!bundle || !bundle.isActive)
    throw new AppError(httpStatus.NOT_FOUND, "Bundle not available");

  let finalAmount = bundle.price;
  let discountAmount = 0;
  let appliedCoupon = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true
    });

    if (!coupon)
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid coupon");

    if (new Date() > coupon.expiresAt)
      throw new AppError(httpStatus.BAD_REQUEST, "Coupon expired");

    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (bundle.price * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }

    finalAmount = bundle.price - discountAmount;
    appliedCoupon = coupon.code;
  }

  let stripeCustomerId = user.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name
    });

    stripeCustomerId = customer.id;
    user.stripeCustomerId = stripeCustomerId;
    await user.save();
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: stripeCustomerId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: bundle.name },
          unit_amount: Math.round(finalAmount * 100)
        },
        quantity: 1
      }
    ],
    success_url: `${process.env.FRONTEND_URL}/success`,
    cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    metadata: {
      userId,
      bundleId,
      coupon: appliedCoupon || "",
      total: String(finalAmount)
    }
  });

  await Payment.create({
    user: userId,
    itemType: "BUNDLE",
    itemId: bundleId,
    stripeSessionId: session.id,
    amount: finalAmount,
    status: "PENDING",
    expiresAt: new Date(Date.now() + 30 * 60 * 1000)
  });

  return session.url;
};

export const BundleService = {
  createBundle,
  getAllBundles,
  getSingleBundle,
  getBundleByIdPublic,
  updateBundle,
  deleteBundle,
  createBundleCheckout
};