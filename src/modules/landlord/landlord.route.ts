import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../../../generated/prisma/enums";

import { propertyController } from "../property/property.controller";
import { propertyValidation } from "../property/property.validation";
import { rentalRequestController } from "../rentalRequest/rentalRequest.controller";
import { rentalRequestValidation } from "../rentalRequest/rentalRequest.validation";

const router = Router();

router.use(auth(Role.LANDLORD));

router.post(
  "/properties",
  validateRequest(propertyValidation.createPropertyValidationSchema),
  propertyController.createProperty,
);

router.put(
  "/properties/:id",
  validateRequest(propertyValidation.updatePropertyValidationSchema),
  propertyController.updateProperty,
);

router.delete("/properties/:id", propertyController.deleteProperty);

router.get("/requests", rentalRequestController.getLandlordRentalRequests);

router.patch(
  "/requests/:id",
  validateRequest(rentalRequestValidation.updateStatusValidationSchema),
  rentalRequestController.updateRentalRequestStatus,
);

export const landlordRoutes = router;
