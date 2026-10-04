import { z } from "zod";

export const createCategory = z.object({
  name: z.string({
      message: "Category name is required"
    }).min(2, "Name must be at least 2 characters"),
   image: z.string().optional(),
});

export const updateCategory = z.object({
  name: z.string().min(2).optional(),
   image: z.string().optional(),
});