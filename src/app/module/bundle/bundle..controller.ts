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

    const result = await BundleService.getSingleBundle(id as string);

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

    const result = await BundleService.getBundleByIdPublic(id as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Public bundle fetched successfully",
      data: result,
    });
  }
);

const updateBundle = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BundleService.updateBundle(id as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Bundle updated successfully",
    data: result
  });
});

const deleteBundle = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BundleService.deleteBundle(id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Bundle deleted successfully",
    data: result
  });
});

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
  updateBundle,
  deleteBundle,
  createCheckout
};
