import { Types } from "mongoose";

export type ReviewItemType = "product" | "course"; // 🔥 CHANGED

export interface IReview {
  itemId: Types.ObjectId;      // 🔥 CHANGED (previously product)
  itemType: ReviewItemType;    // 🔥 ADDED
  user: Types.ObjectId;
  rating: number;
  comment?: string;
}