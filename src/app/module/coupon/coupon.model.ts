import { Schema, model } from "mongoose";
import { ICoupon } from "./coupon.interface";

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["PERCENTAGE", "FLAT"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
    },
    minOrderAmount: {
      type: Number,
    },
    maxDiscountAmount: {
      type: Number,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Coupon = model<ICoupon>("Coupon", couponSchema);