import { z } from "zod";
import { PlanType } from "./order.interface";

export const createOrderValidation = z.object({
  productId: z.string({
      message: "Product ID is required",
    }),
  quantity: z.number({
      message: "Quantity is required",
    }).min(1, { message: "Quantity must be a positive number" 
        
    }),
  planType: z.enum(Object.values(PlanType) as [string, ...string[]]).optional(),
  couponCode: z.string().optional()
});