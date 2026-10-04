import { Types } from "mongoose";

export interface IVideo {
  course: Types.ObjectId;
  milestone: Types.ObjectId;

  title: string;
  description?: string;

  videoKey: string; // store S3 key only
  duration?: number;

  order: number;
  isPublished: boolean;
}