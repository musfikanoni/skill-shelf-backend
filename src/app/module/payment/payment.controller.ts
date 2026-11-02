import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { PaymentService } from "./payment.service";

const verifySession = catchAsync(async (req: Request, res: Response) => {
  const sessionId = (req.query.sessionId as string) || req.body.sessionId;

  const result = await PaymentService.verifyCheckoutSession(sessionId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message || "Payment verified",
    data: result,
  });
});

export const PaymentController = {
  verifySession,
};

