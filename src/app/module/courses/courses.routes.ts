import { Schema, model } from "mongoose";
import { ICourse } from "./courses.interface";

const courseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },

    thumbnail: { type: String, required: true },
 category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    price: { type: Number, required: true },

    isPublished: { type: Boolean, default: false },

    averageRating: {              
      type: Number,
      default: 0,
    },

    totalReviews: {                
      type: Number,
      default: 0,
    },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Course = model<ICourse>("Course", courseSchema);