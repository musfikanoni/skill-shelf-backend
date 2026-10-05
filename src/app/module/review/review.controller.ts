import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { ReviewService } from "./review.services";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";

const createReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    const userId = user.userId;
  const result = await ReviewService.createReview(req.body, userId)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review created successfully",
    data: result
  });
});

const getReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getReviews(req.query as any);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Reviews retrieved successfully",
    data: result,
  });
});

const updateReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await ReviewService.updateReview(req.params.id as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review updated successfully",
    data: result
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await ReviewService.deleteReview(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review deleted successfully",
    data: result
  });
});
const canReview = catchAsync(async (req: Request, res: Response) => {

  const user = req.user as JwtPayload;
  const userId = user.userId;

  const itemId = req.query.itemId as string;
  const itemType = req.query.itemType as "product" | "course";

  if (!itemId || !itemType) {
    throw new AppError(httpStatus.BAD_REQUEST, "itemId and itemType are required");
  }

  const result = await ReviewService.canReview(
    userId,
    itemId,
    itemType
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review permission checked",
    data: { canReview: result },
  });
});
export const ReviewController = {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
  canReview
};