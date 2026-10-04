import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { BundleService } from "./bundle.services";

const createBundle = catchAsync(async (req: Request, res: Response) => {
  const result = await BundleService.createBundle(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Bundle created successfully",
    data: result
  });
});

const getAllBundles = catchAsync(async (req: Request, res: Response) => {
  const result = await BundleService.getAllBundles();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Bundles retrieved",
    data: result
  });
});

const getSingleBundle = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const result = await BundleService.getSingleBundle(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Bundle fetched successfully",
      data: result,
    });
  }
);

const getBundleByIdPublic = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await BundleService.getBundleByIdPublic(id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Public bundle fetched successfully",
      data: result,
    });
  }
);

const createCheckout = catchAsync(async (req: any, res: Response) => {
  const userId = req.user.userId;
  const { bundleId, couponCode } = req.body;

  const url = await BundleService.createBundleCheckout(
    userId,
    bundleId,
    couponCode
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Checkout created",
    data: { checkoutUrl: url }
  });
});

export const BundleController = {
  createBundle,
  getAllBundles,
  getSingleBundle,
  getBundleByIdPublic,
  createCheckout
};