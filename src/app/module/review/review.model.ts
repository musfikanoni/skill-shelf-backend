import { Schema, model, Types } from "mongoose";
import { IReview } from "./review.interface";

const reviewSchema = new Schema<IReview>(
  {
    itemId: {                       // 🔥 CHANGED
      type: Types.ObjectId,
      required: true,
    },

    itemType: {                     // 🔥 ADDED
      type: String,
      enum: ["product", "course"],
      required: true,
    },

    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,                       // 🔥 UPDATED (0 → 1)
      max: 5,
    },

    comment: {
      type: String,
    },
  },
  { timestamps: true }
);

// 🔥 CHANGED (previous index updated)
reviewSchema.index({ itemId: 1, itemType: 1, user: 1 }, { unique: true });

export const Review = model<IReview>("Review", reviewSchema);