import { Schema, model } from "mongoose";
import { CommissionStatus, IAffiliate } from "./affiliate.interface";

const affiliateSchema = new Schema<IAffiliate>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    referredUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(CommissionStatus),
      default: CommissionStatus.PENDING,
    },
  },
  { timestamps: true }
);

export const Affiliate = model<IAffiliate>(
  "Affiliate",
  affiliateSchema
);