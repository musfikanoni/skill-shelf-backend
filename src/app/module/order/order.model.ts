import { Schema, model } from "mongoose";
import { IOrder, OrderStatus, PlanType } from "./order.interface";

const orderSchema = new Schema<IOrder>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        stripeSessionId: { type: String },
        stripePaymentIntentId: { type: String },
        planType: {
            type: String,
            enum: Object.values(PlanType),
            required: true,
        },
        couponCode: { type: String },
        discountAmount: { type: Number, default: 0 },
        finalAmount: { type: Number, required: true },
        currency: { type: String, default: "usd" },

        status: {
            type: String,
            enum: Object.values(OrderStatus),
            default: OrderStatus.PENDING,
        },
        productQuantity: {
            type: Number,
            required: true,
            min: 1
        }
    },
    { timestamps: true }
);

export const Order = model<IOrder>("Order", orderSchema);