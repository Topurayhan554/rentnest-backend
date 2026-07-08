import { email, z } from "zod";

const registerValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, { message: "Name is required" })
      .min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email" }),

    password: z.string().min(6, {
      message: "Password must be at least 6 characters",
    }),
    role: z.enum(["TENANT", "LANDLORD", "ADMIN"], {
      message: "Invalid role",
    }),
  }),
});

const updateProfileValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
  }),
});

export const userValidation = {
  registerValidationSchema,
  updateProfileValidationSchema,
};
