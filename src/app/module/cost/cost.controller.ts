import { Request, Response } from "express";
import { CostService } from "./cost.services";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

const createCost = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const userId = user.userId;
    const result = await CostService.createCost(req.body, userId );
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Cost created successfully",
        data: result,
    });
});

const getAllCosts = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const userId = user.userId;
    const result = await CostService.getAllCosts(userId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Costs retrieved successfully",
        data: result,
    });
});

const getSingleCost = catchAsync(async (req: Request, res: Response) => {
    const result = await CostService.getSingleCost(req.params.id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Cost retrieved successfully",
        data: result,
    });
});

const updateCost = catchAsync(async (req: Request, res: Response) => {
    const result = await CostService.updateCost(req.params.id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Cost updated successfully",
        data: result,
    });
});

const deleteCost = catchAsync(async (req: Request, res: Response) => {
    await CostService.deleteCost(req.params.id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Cost deleted successfully",
        data: null,
    });
});

export const CostController = {
    createCost,
    getAllCosts,
    getSingleCost,
    updateCost,
    deleteCost
};