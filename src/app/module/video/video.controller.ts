import { Request, Response } from "express";
import { VideoService } from "./video.services";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

const createVideo = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Express.MulterS3.File[];

  if (!files || files.length === 0) {
    throw new Error("Video file required");
  }

  const videoFile = files[0];

  const result = await VideoService.createVideo({
    ...req.body,
    videoKey: videoFile.key,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Video created successfully",
    data: result,
  });
})

const getSecureVideo = async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  const result = await VideoService.getSecureVideo(
    req.params.id as string,
    user.userId
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Video retrieved successfully",
    data: result,
  });
};

const publishVideo = catchAsync(async (req: Request, res: Response) => {
  const result = await VideoService.updateVideo(
    req.params.id as string,
    { isPublished: true }
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Video published",
    data: result,
  });
});

const getVideosByMilestone = catchAsync(async (req: Request, res: Response) => {
  const result = await VideoService.getVideosByMilestone(
    req.params.milestoneId as string
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Videos retrieved successfully",
    data: result,
  });
});
const deleteVideo = catchAsync(async (req: Request, res: Response) => {
  const result = await VideoService.deleteVideo(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message,
    data: null,
  });
});
export const VideoController = {
  createVideo,
  getSecureVideo,
  publishVideo,
  getVideosByMilestone,
  deleteVideo
};