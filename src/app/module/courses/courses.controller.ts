import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import { sendResponse } from "../../utils/sendResponse";
import { CourseService } from "./courses.services";
import { getFileUrl } from "../../config/S3Client.config";
import httpStatus from "http-status-codes";

const createCourse = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  const files = req.files as Express.MulterS3.File[];

  if (!files || files.length === 0) {
    throw new Error("Thumbnail is required");
  }

  const thumbnailUrl = getFileUrl(files[0]);

  const payload = {
    ...req.body,
    thumbnail: thumbnailUrl,
    createdBy: user.userId,
  };

  const result = await CourseService.createCourse(payload);
console.log(result)
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Course created successfully",
    data: result,
  });
});

const getAllCourses = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseService.getAllCourses();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Courses retrieved successfully",
    data: result,
  });
});

const getSinglePublicCourse = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseService.getSinglePublicCourse(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Course retrieved successfully",
    data: result,
  });
});

const getSingleCourse = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseService.getSingleCourse(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Course retrieved successfully",
    data: result,
  });
});

const updateCourse = catchAsync(async (req: Request, res: Response) => {

  const files = req.files as Express.MulterS3.File[];

  if (files && files.length > 0) {
    req.body.thumbnail = getFileUrl(files[0]);
  }

  const result = await CourseService.updateCourse(req.params.id as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Course updated successfully",
    data: result,
  });
});

const deleteCourse = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseService.deleteCourse(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Course deleted successfully",
    data: result,
  });
});


export const CourseController = {
  createCourse,
  getAllCourses,
  getSingleCourse,
  getSinglePublicCourse,
  updateCourse,
  deleteCourse,
};