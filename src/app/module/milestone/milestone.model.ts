import { Schema, model } from "mongoose";
import { IMilestone } from "./milestone.interface";

const milestoneSchema = new Schema<IMilestone>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    title: { type: String, required: true, trim: true },
    description: { type: String },

    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ⚡ performance index (VERY IMPORTANT)
milestoneSchema.index({ course: 1, order: 1 });

export const Milestone = model<IMilestone>("Milestone", milestoneSchema);