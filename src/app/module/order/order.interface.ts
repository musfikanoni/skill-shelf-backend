import { Types } from "mongoose";

export enum OrderStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    FAILED = "FAILED"
};
export enum PlanType {
    basic = "basic",
    pro = "pro",
    vip = "vip"
};

export interface IOrder {
    user: Types.ObjectId;
    product: Types.ObjectId;

    stripeSessionId?: string;
    stripePaymentIntentId?: string;

    couponCode?: string;
    planType: PlanType;
    discountAmount: number;
    finalAmount: number;
    currency: string;

    status: OrderStatus;
    productQuantity: number;

    createdAt?: Date;
    updatedAt?: Date;
}