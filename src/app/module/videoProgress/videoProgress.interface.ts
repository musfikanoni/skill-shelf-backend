import { Types } from "mongoose";

export interface IVideoProgress {
  user: Types.ObjectId;
  course: Types.ObjectId;
  milestone: Types.ObjectId;
  video: Types.ObjectId;

  watchedDuration: number; // seconds
  totalDuration: number;   // seconds

  isCompleted: boolean;
  completedAt?: Date;
}