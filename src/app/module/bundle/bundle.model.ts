import { Schema, model } from "mongoose";
import { IBundle } from "./bundle.interface";

const bundleSchema = new Schema<IBundle>(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },

    products: [
      { type: Schema.Types.ObjectId, ref: "Product" }
    ],

    courses: [
      { type: Schema.Types.ObjectId, ref: "Course" }
    ],

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Bundle = model<IBundle>("Bundle", bundleSchema);