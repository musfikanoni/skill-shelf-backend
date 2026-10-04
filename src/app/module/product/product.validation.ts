import { z } from "zod";

export const createProduct = z.object({
  name: z.string({
    message: "Product name is required"
  }),

  category: z.string({
    message: "Category is required"
  }),

  price: z.object({
    basic: z.coerce.number().min(0),
    pro: z.coerce.number().min(0),
    vip: z.coerce.number().min(0),
  }),

});

export const updateProduct = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
  price: z.object({
    basic: z.coerce.number().min(0),
    pro: z.coerce.number().min(0),
    vip: z.coerce.number().min(0),
  }).optional(),
});