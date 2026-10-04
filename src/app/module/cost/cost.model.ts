import { Schema, model } from "mongoose";
import { CostSubType, CostType, ICost } from "./cost.interface";

const costSchema = new Schema<ICost>(
    {
        userId: { type: String, required: true },
        name: { type: String, required: true, trim: true },
        type: {
            type: String,
            enum: Object.values(CostType),
            default: null,
        },
        subtype: { 
            type: String,
            enum: Object.values(CostSubType),
            default: null,
        },
        amount: { type: Number, required: true },
        period: {
            type: String,
            enum: ["day", "week", "month", "year"],
            required: true,
        },
    },
    { timestamps: true }
);

export const Cost = model<ICost>("Cost", costSchema);