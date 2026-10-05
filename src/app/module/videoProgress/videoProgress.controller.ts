import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { VideoProgressService } from "./videoProgress.services";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import AppError from "../../errorHelpers/AppError";

const updateProgress = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  const { videoId, watchedDuration } = req.body;

  const result = await VideoProgressService.updateProgress(
    user.userId,
    videoId,
    watchedDuration
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Progress updated successfully",
    data: result,
  });
});

const markComplete = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const { videoId } = req.body;

    const result = await VideoProgressService.markComplete(
        user.userId,
        videoId
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Video marked as completed",
        data: result,
    });
});

const getCourseProgress = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const { courseId } = req.params;

    const result =
        await VideoProgressService.getCourseProgress(
            user.userId,
            courseId as string
        );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Course progress retrieved successfully",
        data: result,
    });
});

const getVideoResume = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const { videoId } = req.params;

    const result = await VideoProgressService.getVideoResume(
        user.userId,
        videoId as string
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Video resume retrieved successfully",
        data: result,
    });
});

const getNextVideo = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  const { courseId } = req.params;
  const { currentOrder } = req.query;

  if (!currentOrder) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "currentOrder is required"
    );
  }

  const result = await VideoProgressService.getNextVideo(
    user.userId,
    courseId as string,
    Number(currentOrder)
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Next video retrieved successfully",
    data: result,
  });
});

export const VideoProgressController = {
    updateProgress,
    markComplete,
    getCourseProgress,
    getVideoResume,
    getNextVideo,
};