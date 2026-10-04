import { NextFunction, Request, Response } from "express";
import { DashboardServices } from "./dashboard.services";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";

const dashboardOverview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data = await DashboardServices.getDashboardOverview();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Dashboard overview fetched successfully",
        data: data,
    });
}
)
const getUserDashboard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    const userId = user.userId;
    const data = await DashboardServices.getUserDashboard(userId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Dashboard overview fetched successfully",
        data: data,
    });
}
)


export const DashboardController = {
    dashboardOverview,
    getUserDashboard
}