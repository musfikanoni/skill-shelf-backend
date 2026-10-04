import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { EnrollmentService } from "./enrollment.services";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";

const createCheckoutSession = async (
  req: Request,
  res: Response
) => {
  const user = req.user as JwtPayload;
  const userId = user.userId;

  const { courseId } = req.body;

  const url =
    await EnrollmentService.createCourseCheckoutSession(
      userId,
      courseId
    );

  res.status(200).json({
    success: true,
    checkoutUrl: url,
  });
};

const getAllEnrollments = catchAsync(async (req: Request, res: Response) => {
  const result = await EnrollmentService.getAllEnrollments();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Orders retrieved successfully",
    data: result
  });
});

const getSingleEnrollment = catchAsync(async (req: Request, res: Response) => {
  const result = await EnrollmentService.getSingleEnrollment(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Order retrieved successfully",
    data: result
  });
});

const getMyEnrollments = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  const result = await EnrollmentService.getMyEnrollments(user.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "My orders retrieved successfully",
    data: result
  });
});
export const EnrollmentController = {
  createCheckoutSession,
  getAllEnrollments,
  getSingleEnrollment,
  getMyEnrollments
};