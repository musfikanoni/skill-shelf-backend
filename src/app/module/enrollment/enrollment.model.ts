import { Schema, model } from "mongoose";
import { IEnrollment } from "./enrollment.interface";

const enrollmentSchema = new Schema<IEnrollment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },

    stripeSessionId: { type: String, required: true },
    paymentIntentId: String,

    amount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },

    enrolledAt: Date,
  },
  { timestamps: true }
);

// 🔥 Prevent duplicate purchase
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

export const Enrollment = model<IEnrollment>(
  "Enrollment",
  enrollmentSchema
);