import { Coupon } from "./coupon.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";

// CREATE
const createCoupon = async (payload: any) => {
  const existing = await Coupon.findOne({ code: payload.code.toUpperCase() });

  if (existing) {
    throw new AppError(httpStatus.BAD_REQUEST, "Coupon already exists");
  }

  payload.code = payload.code.toUpperCase();

  return await Coupon.create(payload);
};

// GET ALL
const getAllCoupons = async () => {
  return await Coupon.find().sort({ createdAt: -1 });
};

// GET SINGLE
const getSingleCoupon = async (id: string) => {
  const coupon = await Coupon.findById(id);

  if (!coupon) {
    throw new AppError(httpStatus.NOT_FOUND, "Coupon not found");
  }

  return coupon;
};

// UPDATE
const updateCoupon = async (id: string, payload: any) => {
  const coupon = await Coupon.findById(id);

  if (!coupon) {
    throw new AppError(httpStatus.NOT_FOUND, "Coupon not found");
  }

  return await Coupon.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

// DELETE
const deleteCoupon = async (id: string) => {
  const coupon = await Coupon.findById(id);

  if (!coupon) {
    throw new AppError(httpStatus.NOT_FOUND, "Coupon not found");
  }

  await Coupon.findByIdAndDelete(id);

  return null;
};

export const CouponService = {
  createCoupon,
  getAllCoupons,
  getSingleCoupon,
  updateCoupon,
  deleteCoupon,
};