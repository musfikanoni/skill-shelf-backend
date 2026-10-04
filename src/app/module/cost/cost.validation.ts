import { z } from "zod";

export const createCostSchema = z.object({
    // userId: z.string(),
    name: z.string().min(1),
    type: z.string().optional(),
    subtype: z.string().optional(),
    amount: z.number().positive(),
    period: z.enum(["day", "week", "month", "year"]),
});