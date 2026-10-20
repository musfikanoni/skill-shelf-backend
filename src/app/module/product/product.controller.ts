import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { ProductService } from "./product.services";
import { catchAsync } from "../../utils/catchAsync";
import { getFileUrl } from "../../config/cloudinary.config";
import { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import AppError from "../../errorHelpers/AppError";

const createProduct = catchAsync(async (req: Request, res: Response) => {

  const files = req.files as any;

  const payload = {
    ...req.body,
     images: files?.images
    ? files.images.map((f: any) => getFileUrl(f))
    : [],

  files: {
    basic: files?.basicFile?.[0]
      ? getFileUrl(files.basicFile[0])
      : null,

    pro: files?.proFile?.[0]
      ? getFileUrl(files.proFile[0])
      : null,

    vip: files?.vipFile?.[0]
      ? getFileUrl(files.vipFile[0])
      : null,
  }
  }
  const result = await ProductService.createProduct(payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Product created successfully",
    data: result
  });
});

const getAllProducts = catchAsync(async (req, res) => {
  const result = await ProductService.getAllProducts(req.query as any);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Products retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleProduct = catchAsync(async (req: Request, res: Response) => {

  // const user = req.user as JwtPayload;
const id = req.params.id as string;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid Product ID");
  }
  const result = await ProductService.getSingleProduct(
    id
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Product retrieved successfully",
    data: result
  });
});
const getMyUnlockedProducts = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  const result = await ProductService.getMyUnlockedProducts(
    user.userId,
    req.query as Record<string, string>
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Unlocked products retrieved successfully",
    data: result,
  });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {

  const files = req.files as any;

  const payload: any = { ...req.body };

  // 🔥 Update images if provided
  if (files?.images && files.images.length > 0) {
    payload.images = files.images.map((f: any) => getFileUrl(f));
  }

  // 🔥 Update plan files if provided
  if (files?.basicFile?.[0]) {
    payload["files.basic"] = getFileUrl(files.basicFile[0]);
  }

  if (files?.proFile?.[0]) {
    payload["files.pro"] = getFileUrl(files.proFile[0]);
  }

  if (files?.vipFile?.[0]) {
    payload["files.vip"] = getFileUrl(files.vipFile[0]);
  }

  const result = await ProductService.updateProduct(req.params.id as string, payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Product updated successfully",
    data: result
  });
});

const deleteProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await ProductService.deleteProduct(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Product deleted successfully",
    data: result
  });
});


const getUnlockSingleProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as JwtPayload;
  const result = await ProductService.getUnlockSingleProduct(
    req.params.id as string,
    user.userId
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Product retrieved",
    data: result,
  });
});

export const ProductController = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getUnlockSingleProduct,
  getMyUnlockedProducts
};