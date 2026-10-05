/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { UserServices } from "./user.services";
import { sendResponse } from "../../utils/sendResponse";

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {


    const user = await UserServices.createUser(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User Created Successfully. OTP sent to email. Please verify your account.",
      data: user,
    });
  }
);

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await UserServices.getAllUsers(
      query as Record<string, string>
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All Users Retrieved Successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const result = await UserServices.getMe(decodedToken.userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Your profile Retrieved Successfully",
      data: result.data,
    });
  }
);

const getSingleUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await UserServices.getSingleUser(id as string);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User Retrieved Successfully",
      data: result.data,
    });
  }
);

const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const verifiedToken = req.user;

    const payload = req.body;
    const user = await UserServices.updateUser(
      userId,
      payload,
      verifiedToken as JwtPayload
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User Updated Successfully",
      data: user,
    });
  }
);

const updateMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const userId = decodedToken.userId;
const uploadedFile = (req.files as Express.MulterS3.File[])?.[0];

    const updatedUser = await UserServices.updateMyProfile({
      userId,
      payload: req.body,
      decodedToken,
      file: uploadedFile,
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Profile updated successfully.",
      data: updatedUser,
    });
  }
);

const deleteUserById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await UserServices.deleteUserById(id as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User deleted successfully",
      data: result,
    });
  }
);

const deleteAllUsers = catchAsync(
  async (req: Request, res: Response) => {
    const result = await UserServices.deleteAllUsers();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All users deleted successfully",
      data: result,
    });
  }
);

const deleteOwnAccount = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const decodedToken = req.user as JwtPayload;
  const userId = decodedToken.userId

  const result = await UserServices.deleteOwnAccount(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message,
    data: null,
  });
});

const getMyLibrary = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  const result = await UserServices.getMyLibrary(user.userId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "My library fetched successfully",
    data: result,
  });
});

export const UserControllers = {
  createUser,
  getAllUsers,
  getMe,
  getSingleUser,
  updateUser,
  updateMyProfile,
  deleteUserById,
  deleteAllUsers,
  deleteOwnAccount,
  getMyLibrary
};
