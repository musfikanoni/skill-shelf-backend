import { Schema, model } from "mongoose";
import { PlanType } from "../order/order.interface";


const paymentSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },

        itemType: {
            type: String,
            enum: ["COURSE", "PRODUCT", "SUBSCRIPTION", "BUNDLE"],
            required: true,
        },

        itemId: { type: Schema.Types.ObjectId, refPath: "itemType", required: true },

        stripeSessionId: { type: String, unique: true },

        amount: Number,

        status: {
            type: String,
            enum: ["PENDING", "PAID", "FAILED", "EXPIRED"],
            default: "PENDING",
        },

        expiresAt: {
            type: Date,
            required: true,
        },
        quantity: {
            type: Number,
            required: function () {
                return this.itemType === "PRODUCT";
            },
        },
        planType: {
            type: String,
            enum: Object.values(PlanType),
            required: function () {
                return this.itemType === "PRODUCT";
            },
        },
    },
    { timestamps: true }
);

export const Payment = model("Payment", paymentSchema);