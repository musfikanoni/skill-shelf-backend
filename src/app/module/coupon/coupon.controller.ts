import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { CouponService } from "./coupon.services";

// CREATE
const createCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponService.createCoupon(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Coupon created successfully",
    data: result,
  });
});

// GET ALL
const getAllCoupons = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponService.getAllCoupons();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Coupons retrieved successfully",
    data: result,
  });
});

// GET SINGLE
const getSingleCoupon = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await CouponService.getSingleCoupon(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Coupon retrieved successfully",
    data: result,
  });
});

// UPDATE
const updateCoupon = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await CouponService.updateCoupon(id as string, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Coupon updated successfully",
    data: result,
  });
});

// DELETE
const deleteCoupon = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  await CouponService.deleteCoupon(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Coupon deleted successfully",
    data: null,
  });
});

export const CouponController = {
  createCoupon,
  getAllCoupons,
  getSingleCoupon,
  updateCoupon,
  deleteCoupon,
};