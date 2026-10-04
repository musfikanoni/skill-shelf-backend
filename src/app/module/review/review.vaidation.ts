import { z } from "zod";

export const createReviewValidation = z.object({
  itemId: z.string(),                     // 🔥 CHANGED
  itemType: z.enum(["product", "course"]), // 🔥 ADDED
  rating: z.number().min(1).max(5),        // 🔥 UPDATED
  comment: z.string().optional(),
});