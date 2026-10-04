import { Types } from "mongoose";

export interface IMilestone {
  course: Types.ObjectId;

  title: string;
  description?: string;

  order: number; // important for sorting lessons
}