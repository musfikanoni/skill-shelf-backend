import { Video } from "./video.model";
import { Milestone } from "../milestone/milestone.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { deleteFileFromS3 } from "../../config/cloudinary.config";
// generateSignedUrl replaced by Cloudinary URL (stored directly as public URL)
// import { Enrollment } from "../enrollment/enrollment.model";
import { Payment } from "../payment/payment.model";
import { videoQueue } from "../../config/queue";

const createVideo = async (payload: any) => {
  // Check milestone exists
  const milestone = await Milestone.findById(payload.milestone);

  if (!milestone) {
    throw new AppError(httpStatus.NOT_FOUND, "Milestone not found");
  }

  // Auto order
  if (!payload.order) {
    const lastVideo = await Video.findOne({
      milestone: payload.milestone,
    }).sort({ order: -1 });

    payload.order = lastVideo ? lastVideo.order + 1 : 1;
  }

  const video = await Video.create({
    ...payload,
    duration: payload.duration || 0, // placeholder
  });

  // 🔥 ADD: push to queue for processing
  await videoQueue.add("extract-duration", {
    videoId: video._id,
    videoKey: video.videoKey,
  });

  return video;
};
const getVideosByMilestone = async (milestoneId: string) => {
  return await Video.find({ milestone: milestoneId })
    .sort({ order: 1 });
};


const getSecureVideo = async (
  videoId: string,
  userId: string
) => {
  const video = await Video.findById(videoId);
console.log("userId:", userId)
  if (!video) {
    throw new AppError(httpStatus.NOT_FOUND, "Video not found");
  }

const payment = await Payment.findOne({
  user: userId,
  itemType: "COURSE",
  itemId: video.course,
  status: "PAID",
});

if (!payment) {
  throw new AppError(
    httpStatus.FORBIDDEN,
    "You must purchase this course"
  );
}
console.log("enrollment: ", payment)
console.log("video.course:", video.course.toString());
console.log("video.course type:", typeof video.course.toString());
console.log("video.course value:", video.course);


  // 2️⃣ Cloudinary stores video as public URL — use directly
  // (videoKey holds the full Cloudinary URL after upload)
  const signedUrl = video.videoKey;

  return {
    ...video.toObject(),
    signedUrl,
  };
};


const updateVideo = async (id: string, payload: any) => {
  const video = await Video.findByIdAndUpdate(id, payload, {
    new: true,
  });

  if (!video) {
    throw new AppError(httpStatus.NOT_FOUND, "Video not found");
  }

  return video;
};

const deleteVideo = async (id: string) => {
  const video = await Video.findById(id);

  if (!video) {
    throw new AppError(httpStatus.NOT_FOUND, "Video not found");
  }

  // 🔥 Delete file from S3
  if (video.videoKey) {
    await deleteFileFromS3(video.videoKey);
  }

  // 🔥 Delete from database
  await Video.findByIdAndDelete(id);

  return {
    message: "Video deleted successfully",
  };
};
export const VideoService = {
  createVideo,
  getVideosByMilestone,
  getSecureVideo,
  updateVideo,
  deleteVideo,
};
