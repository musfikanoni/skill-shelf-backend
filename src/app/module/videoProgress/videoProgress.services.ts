import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { Enrollment } from "../enrollment/enrollment.model";
import { Video } from "../video/video.model";
import { VideoProgress } from "./videoProgress.model";

const updateProgress = async (
  userId: string,
  videoId: string,
  watchedDuration: number
) => {
  const video = await Video.findById(videoId);

  if (!video) {
    throw new AppError(httpStatus.NOT_FOUND, "Video not found");
  }

  // Enrollment check
  const enrolled = await Enrollment.findOne({
    user: userId,
    course: video.course,
    status: "PAID",
  });

  if (!enrolled) {
    throw new AppError(httpStatus.FORBIDDEN, "Access denied");
  }

  const totalDuration = video.duration || 0;

  // Prevent overflow
  const safeWatchedDuration = Math.min(watchedDuration, totalDuration);

  // Get existing progress
  const existingProgress = await VideoProgress.findOne({
    user: userId,
    video: videoId,
  });

  // Prevent rewind overwrite
  const finalWatchedDuration = Math.max(
    existingProgress?.watchedDuration || 0,
    safeWatchedDuration
  );

  const isCompleted =
    totalDuration > 0 &&
    finalWatchedDuration >= totalDuration * 0.9;

  const progress = await VideoProgress.findOneAndUpdate(
    { user: userId, video: videoId },
    {
      user: userId,
      course: video.course,
      milestone: video.milestone,
      video: videoId,
      watchedDuration: finalWatchedDuration,
      totalDuration,
      isCompleted,
      completedAt: isCompleted ? new Date() : undefined,
    },
    { upsert: true, new: true }
  );

  return progress;
};

const markComplete = async (userId: string, videoId: string) => {
  const video = await Video.findById(videoId);

  if (!video) {
    throw new AppError(httpStatus.NOT_FOUND, "Video not found");
  }

  // ✅ ADD: enrollment check
  const enrolled = await Enrollment.findOne({
    user: userId,
    course: video.course,
    status: "PAID",
  });

  if (!enrolled) {
    throw new AppError(httpStatus.FORBIDDEN, "Access denied");
  }

  return VideoProgress.findOneAndUpdate(
    { user: userId, video: videoId },
    {
      user: userId,
      course: video.course,
      milestone: video.milestone,
      video: videoId,
      isCompleted: true,
      completedAt: new Date(),
      watchedDuration: video.duration || 0,
      totalDuration: video.duration || 0,
    },
    { upsert: true, new: true }
  );
};

const getCourseProgress = async (userId: string, courseId: string) => {

  const videos = await Video.find({
    course: courseId,
    isPublished: true,
  }).lean();

  const totalVideos = videos.length;

  const totalDuration = videos.reduce(
    (sum, v) => sum + (v.duration || 0),
    0
  );

  const progressList = await VideoProgress.find({
    user: userId,
    course: courseId,
  });

  const completedVideos = progressList.filter(
    (v) => v.isCompleted
  ).length;

  const watchedDuration = progressList.reduce(
    (sum, v) => sum + (v.watchedDuration || 0),
    0
  );

  const progress =
    totalVideos === 0
      ? 0
      : Math.round((completedVideos / totalVideos) * 100);

  return {
    totalVideos,
    totalDuration,
    watchedDuration,
    completedVideos,
    progress,
  };
};
const getVideoResume = async (userId: string, videoId: string) => {
  const video = await Video.findById(videoId);

  if (!video) {
    throw new AppError(httpStatus.NOT_FOUND, "Video not found");
  }

  const enrolled = await Enrollment.findOne({
    user: userId,
    course: video.course,
    status: "PAID",
  });

  if (!enrolled) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not enrolled"
    );
  }

  return VideoProgress.findOne({
    user: userId,
    video: videoId,
  });
};

const getNextVideo = async (
  userId: string,
  courseId: string,
  currentVideoOrder: number
) => {
  const enrolled = await Enrollment.findOne({
    user: userId,
    course: courseId,
    status: "PAID",
  });

  if (!enrolled) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not enrolled in this course"
    );
  }

//   if (!currentVideoOrder || isNaN(Number(currentVideoOrder))) {
//   throw new AppError(
//     httpStatus.BAD_REQUEST,
//     "currentOrder is required"
//   );
// }

  // 🔎 Find next video
  const nextVideo = await Video.findOne({
    course: courseId,
    order: { $gt: currentVideoOrder },
    isPublished: true,
  }).sort({ order: 1 });

  if (!nextVideo) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "No next video available"
    );
  }

  return nextVideo;
};

export const VideoProgressService = {
  updateProgress,
  markComplete,
  getCourseProgress,
  getVideoResume,
  getNextVideo,
};