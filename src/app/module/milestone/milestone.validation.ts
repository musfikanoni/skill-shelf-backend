import { z } from "zod";

export const createMilestoneZodSchema = z.object({
  course: z.string(),

  title: z.string().min(3),
  description: z.string().optional(),

  order: z.number().optional(),
});

export const updateMilestoneZodSchema =
  createMilestoneZodSchema.partial();