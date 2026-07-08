import z from "zod";

const createRentalRequestValidationSchema = z.object({
  body: z.object({
    propertyId: z.string("Property is required"),
    moveInDate: z.string().optional(),
    message: z.string().optional(),
  }),
});

const updateStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(
      ["APPROVED", "REJECTED", "ACTIVE", "COMPLETED"],
      "Valid status is required",
    ),
  }),
});

export const rentalRequestValidation = {
  createRentalRequestValidationSchema,
  updateStatusValidationSchema,
};
