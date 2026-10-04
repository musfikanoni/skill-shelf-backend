import { Milestone } from "./milestone.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { Course } from "../courses/courses.model";
import { Video } from "../video/video.model";

const createMilestone = async (payload: any) => {
  // 1️⃣ Check course exists
  const course = await Course.findById(payload.course);

  if (!course) {
    throw new AppError(httpStatus.NOT_FOUND, "Course not found");
  }

  // 2️⃣ Auto order if not provided
  if (!payload.order) {
    const lastMilestone = await Milestone.findOne({
      course: payload.course,
    }).sort({ order: -1 });

    payload.order = lastMilestone ? lastMilestone.order + 1 : 1;
  }

  const milestone = await Milestone.create(payload);

  return milestone;
};

const getMilestonesByCourse = async (courseId: string) => {
  const milestones = await Milestone.find({ course: courseId })
    .populate("course") 
    .sort({ order: 1 });

  return milestones;
};

const updateMilestone = async (id: string, payload: any) => {
  const milestone = await Milestone.findByIdAndUpdate(id, payload, {
    new: true,
  });

  if (!milestone) {
    throw new AppError(httpStatus.NOT_FOUND, "Milestone not found");
  }

  return milestone;
};

const deleteMilestone = async (id: string) => {
  const milestone = await Milestone.findByIdAndDelete(id);

  if (!milestone) {
    throw new AppError(httpStatus.NOT_FOUND, "Milestone not found");
  }

  // optional cleanup later (videos)
  await Video.deleteMany({ milestone: id });

  return null;
};

export const MilestoneService = {
  createMilestone,
  getMilestonesByCourse,
  updateMilestone,
  deleteMilestone,
};