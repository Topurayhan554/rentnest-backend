import z from "zod";

const createPaymentValidationSchema = z.object({
  body: z.object({
    rentalRequestId: z.string("Rental request is required"),
  }),
});

export const paymentValidation = { createPaymentValidationSchema };
