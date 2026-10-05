import { NextFunction, Request, Response } from "express";
import { Jwt, JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { OrderService } from "./order.services";

const createCheckout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    console.log("REQ BODY:", req.body);
console.log("QUANTITY:", req.body.quantity);
    const user = req.user as JwtPayload;
    const userId = user.userId;
    const { productId,quantity, couponCode, planType } = req.body;

    const url = await OrderService.createProductCheckout(
        userId,
        productId,
        quantity,
        planType,
        couponCode,
    );
console.log("REQ BODY:", req.body);
console.log("QUANTITY:", req.body.quantity);
console.log("COUPON CODE:", req.body.couponCode);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Checkout session created successfully",
        data: { checkoutUrl: url }
    });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getAllOrders();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Orders retrieved successfully",
    data: result
  });
});

const getSingleOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getSingleOrder(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Order retrieved successfully",
    data: result
  });
});


const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  const result = await OrderService.getMyOrders(
    user.userId,
    req.query as Record<string, string>
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Orders retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const OrderController = {
  createCheckout,
  getAllOrders,
  getSingleOrder,
  getMyOrders
};