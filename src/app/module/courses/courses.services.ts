
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { Course } from "./courses.model";
import { ICourse } from "./courses.interface";
import { Video } from "../video/video.model";
import { Milestone } from "../milestone/milestone.model";

const createCourse = async (payload: ICourse) => {
  const course = await Course.create(payload);
  console.log(course)
  return course;
};

const getAllCourses = async () => {
  return await Course.find()
    .populate("createdBy", "name email")
    .populate("category", "name") 
    .sort({ createdAt: -1 });

    
};

const getSinglePublicCourse = async (courseId: string) => {
  const course = await Course.findById(courseId).lean();

  if (!course) {
    throw new AppError(httpStatus.NOT_FOUND, "Course not found");
  }

  // return {
  //   _id: course._id,
  //   title: course.title,
  //   description: course.description,
  //   thumbnail: course.thumbnail,
  //   price: course.price,
  //   category: course.category,
  // };
  return {
    ...course
  };
};

const getSingleCourse = async (courseId: string) => {
  const course = await Course.findById(courseId).lean();

  if (!course) {
    throw new AppError(httpStatus.NOT_FOUND, "Course not found");
  }

  const milestones = await Milestone.find({ course: courseId })
    .sort({ order: 1 })
    .lean();

  const milestoneWithVideos = await Promise.all(
    milestones.map(async (milestone) => {
      const videos = await Video.find({ milestone: milestone._id })
        .sort({ order: 1 })
        .lean();

      return {
        ...milestone,
        videos,
      };
    })
  );

  return {
    ...course,
    milestones: milestoneWithVideos,
  };
};

const updateCourse = async (id: string, payload: Partial<ICourse>) => {
  const course = await Course.findByIdAndUpdate(id, payload, {
    new: true,
  });

  if (!course) {
    throw new AppError(httpStatus.NOT_FOUND, "Course not found");
  }

  return course;
};

const deleteCourse = async (id: string) => {
  const course = await Course.findByIdAndDelete(id);

  if (!course) {
    throw new AppError(httpStatus.NOT_FOUND, "Course not found");
  }

  // optional cleanup (production important)
  await Milestone.deleteMany({ course: id });
  await Video.deleteMany({ course: id });

  return { message: "Course deleted successfully" };
};

export const CourseService = {
  createCourse,
  getAllCourses,
  getSingleCourse,
  getSinglePublicCourse,
  updateCourse,
  deleteCourse,
};