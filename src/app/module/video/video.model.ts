import { Schema, model } from "mongoose";
import { IVideo } from "./video.interface";

const videoSchema = new Schema<IVideo>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    milestone: {
      type: Schema.Types.ObjectId,
      ref: "Milestone",
      required: true,
    },

    title: { type: String, required: true },
    description: String,

    videoKey: { type: String, required: true },

    duration: { type: Number, default: 0 },

    order: { type: Number, default: 0 },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ⚡ performance index
videoSchema.index({ milestone: 1, order: 1 });

export const Video = model<IVideo>("Video", videoSchema);