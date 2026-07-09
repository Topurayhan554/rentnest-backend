import { z } from "zod";

const createReviewValidationSchema = z.object({
  body: z.object({
    propertyId: z.string("Property is required"),
    rating: z
      .number("Rating is required")
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot exceed 5"),
    comment: z.string().optional(),
  }),
});

export const reviewValidation = { createReviewValidationSchema };
