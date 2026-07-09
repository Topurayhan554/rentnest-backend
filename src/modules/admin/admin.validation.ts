import { z } from "zod";

const updateUserStatusValidationSchema = z.object({
  body: z.object({
    activeStatus: z.enum(["ACTIVE", "BLOCKED"], "Valid status is required"),
  }),
});

export const adminValidation = { updateUserStatusValidationSchema };
