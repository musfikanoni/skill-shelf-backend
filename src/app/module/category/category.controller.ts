import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { CategoryService } from "./category.services";
import { sendResponse } from "../../utils/sendResponse";
import { getCloudinaryKeyFromUrl, deleteFileFromCloudinary, getFileUrl } from "../../config/cloudinary.config";

const createCategory = async (req: Request, res: Response) => {
    const file = (req.files as Express.Multer.File[])?.[0];

  const payload = {
    ...req.body,

    image: file?.path || (file as any)?.secure_url || req.body.image,
  };

  const result = await CategoryService.createCategory(payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Category created successfully",
    data: result
  });
};

const getAllCategories = async (req: Request, res: Response) => {
  const result = await CategoryService.getAllCategories();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Categories retrieved successfully",
    data: result
  });
};

const getSingleCategory = async (req: Request, res: Response) => {
  const result = await CategoryService.getSingleCategory(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Category retrieved successfully",
    data: result
  });
};

const updateCategory = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  // 🆕 uploaded file from S3 middleware
  const file = (req.files as Express.Multer.File[])?.[0];

  // find existing category
  const existingCategory = await CategoryService.getSingleCategory(id);

  // 🆕 build payload
  const payload: any = {
    ...req.body,
  };

  // 🆕 image update logic
  if (file) {
    // delete old image if exists
    if (existingCategory?.image) {
      const oldKey = getCloudinaryKeyFromUrl(existingCategory.image);
      if (oldKey) await deleteFileFromCloudinary(oldKey);
    }

    payload.image = getFileUrl(file);
  }

  const result = await CategoryService.updateCategory(id, payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Category updated successfully",
    data: result,
  });
};

const deleteCategory = async (req: Request, res: Response) => {
  const result = await CategoryService.deleteCategory(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Category deleted successfully",
    data: result
  });
};

export const CategoryController = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory
};

