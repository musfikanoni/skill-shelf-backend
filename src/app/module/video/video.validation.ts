import { z } from "zod";

export const createVideoZodSchema = z.object({
  course: z.string(),
  milestone: z.string(),

  title: z.string().min(3),
  description: z.string().optional(),

  order: z.number().optional(),
});

export const updateVideoZodSchema =
  createVideoZodSchema.partial();