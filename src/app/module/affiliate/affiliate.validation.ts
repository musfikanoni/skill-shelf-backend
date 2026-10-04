import { z } from "zod";
import { CommissionStatus } from "./affiliate.interface";

export const createAffiliateZodSchema = z.object({
  referredUser: z.string(),
  amount: z.number().positive(),
});

export const updateAffiliateStatusSchema = z.object({
  status: z.enum(
    Object.values(CommissionStatus) as [string, ...string[]]
  ),
});