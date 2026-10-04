import { z } from "zod";

export const createBundleValidation = z.object({
  body: z.object({
    name: z.string(),
    description: z.string().optional(),
    price: z.number().positive(),
    products: z.array(z.string()).optional(),
    courses: z.array(z.string()).optional(),
    isActive: z.boolean().optional()
  })
});