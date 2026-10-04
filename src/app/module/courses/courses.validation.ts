import { z } from "zod";

export const createCourseZodSchema = z.object({

  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string({
    message: "Category is required"
  }),
  price: z.coerce.number().min(0),

  isPublished: z.coerce.boolean().optional(),

});

export const updateCourseZodSchema = createCourseZodSchema.partial();