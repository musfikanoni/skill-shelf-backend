import { Request, Response } from "express";
import { MilestoneService } from "./milestone.services";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const createMilestone = catchAsync(async (req: Request, res: Response) => {
  const result = await MilestoneService.createMilestone(req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Milestone created successfully",
    data: result,
  });
});

const getMilestonesByCourse = catchAsync(async (req: Request, res: Response) => {
  const result = await MilestoneService.getMilestonesByCourse(
    req.params.courseId as string
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Milestones retrieved successfully",
    data: result,
  });
});

const updateMilestone = catchAsync(async (req: Request, res: Response) => {
  const result = await MilestoneService.updateMilestone(
    req.params.id as string,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Milestone updated successfully",
    data: result,
  });
});

const deleteMilestone = catchAsync(async (req: Request, res: Response) => {
  const result = await MilestoneService.deleteMilestone(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Milestone deleted successfully",
    data: result,
  });
});

export const MilestoneController = {
  createMilestone,
  getMilestonesByCourse,
  updateMilestone,
  deleteMilestone,
};