import { Types } from "mongoose";

export interface IEnrollment {
  user: Types.ObjectId;
  course: Types.ObjectId;

  stripeSessionId: string;
  paymentIntentId?: string;

  amount: number;

  status: "PENDING" | "PAID" | "FAILED";

  enrolledAt?: Date;
}