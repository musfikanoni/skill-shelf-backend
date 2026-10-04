import { z } from "zod";

export const createCouponValidation = z.object({
  body: z.object({
    code: z.string(),
    discountType: z.enum(["PERCENTAGE", "FLAT"]),
    discountValue: z.number(),
    minOrderAmount: z.number().optional(),
    maxDiscountAmount: z.number().optional(),
    expiresAt: z.string(),
    isActive: z.boolean().optional(),
  }),
});

export const updateCouponValidation = z.object({
  body: z.object({
    discountType: z.enum(["PERCENTAGE", "FLAT"]).optional(),
    discountValue: z.number().optional(),
    minOrderAmount: z.number().optional(),
    maxDiscountAmount: z.number().optional(),
    expiresAt: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});