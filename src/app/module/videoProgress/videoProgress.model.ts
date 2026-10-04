import { Schema, model } from "mongoose";
import { IVideoProgress } from "./videoProgress.interface";

const videoProgressSchema = new Schema<IVideoProgress>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    milestone: { type: Schema.Types.ObjectId, ref: "Milestone", required: true },
    video: { type: Schema.Types.ObjectId, ref: "Video", required: true },

    watchedDuration: { type: Number, default: 0 },
    totalDuration: { type: Number, required: true },

    isCompleted: { type: Boolean, default: false },
    completedAt: Date,
  },
  { timestamps: true }
);

// Prevent duplicate per user per video
videoProgressSchema.index(
  { user: 1, video: 1 },
  { unique: true }
);

export const VideoProgress = model<IVideoProgress>(
  "VideoProgress",
  videoProgressSchema
);