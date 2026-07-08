import { z } from "zod";

const propertyTypeEnum = z.enum([
  "APARTMENT",
  "HOUSE",
  "STUDIO",
  "ROOM",
  "VILLA",
]);

const createPropertyValidationSchema = z.object({
  body: z.object({
    title: z.string("Title is required").min(3),
    description: z.string("Description is required").min(10),
    location: z.string("Location is required").min(2),
    price: z.number("Price is required").positive("Price must be positive"),
    type: propertyTypeEnum,
    amenities: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    categoryId: z.string("Category is required"),
  }),
});

const updatePropertyValidationSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    location: z.string().min(2).optional(),
    price: z.number().positive().optional(),
    type: propertyTypeEnum.optional(),
    amenities: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    isAvailable: z.boolean().optional(),
    categoryId: z.string().optional(),
  }),
});

export const propertyValidation = {
  createPropertyValidationSchema,
  updatePropertyValidationSchema,
};
