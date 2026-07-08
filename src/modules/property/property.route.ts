import { Router } from "express";
import { propertyController } from "./property.controller";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { propertyValidation } from "./property.validation";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// Public
router.get("/", propertyController.getAllProperties);

// Landlord
router.get(
  "/my-properties",
  auth(Role.LANDLORD),
  propertyController.getMyProperties,
);

router.post(
  "/",
  auth(Role.LANDLORD),
  validateRequest(propertyValidation.createPropertyValidationSchema),
  propertyController.createProperty,
);
router.patch(
  "/:id",
  auth(Role.LANDLORD),
  validateRequest(propertyValidation.updatePropertyValidationSchema),
  propertyController.updateProperty,
);
router.delete("/:id", auth(Role.LANDLORD), propertyController.deleteProperty);

// Public
router.get("/:id", propertyController.getSingleProperty);

export const propertyRoutes = router;
