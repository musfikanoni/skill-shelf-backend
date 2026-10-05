import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AffiliateService } from "./affiliate.services";

const createAffiliate = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;

    const result = await AffiliateService.createAffiliate(
      user.userId,
      req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Commission created successfully",
      data: result,
    });
  }
);

const getAllAffiliates = catchAsync(
  async (req: Request, res: Response) => {

    const result = await AffiliateService.getAllAffiliates(
      req.query
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All affiliates retrieved successfully",
      data: result,
    });
  }
);

const getMyCommissions = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;

    const result = await AffiliateService.getMyCommissions(
      user.userId
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "My commissions retrieved",
      data: result,
    });
  }
);

const updateCommissionStatus = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await AffiliateService.updateCommissionStatus(
        req.params.id as string,
        req.body.status
      );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Status updated",
      data: result,
    });
  }
);

const deleteAffiliate = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AffiliateService.deleteAffiliate(
      req.params.id as string
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Deleted successfully",
      data: result,
    });
  }
);

export const AffiliateController = {
  createAffiliate,
  getAllAffiliates,
  getMyCommissions,
  updateCommissionStatus,
  deleteAffiliate,
};