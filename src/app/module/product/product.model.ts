import { Schema, model } from "mongoose";
import { IProduct } from "./product.interface";

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },

    // price: {
    //   type: Number,
    //   required: true,
    //   min: 0
    // },

     images: [
      {
        type: String,
      }
    ],

     price: {
      basic: { type: Number, required: true },
      pro: { type: Number, required: true },
      vip: { type: Number, required: true },
    },

    files: {
      basic: { type: String, default: null },
      pro: { type: String, default: null },
      vip: { type: String, default: null },
    },

    averageRating: {
      type: Number,
      default: 0
    },

    totalReviews: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const Product = model<IProduct>("Product", productSchema);