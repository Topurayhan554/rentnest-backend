import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { rentalRequestValidation } from "./rentalRequest.validation";
import { rentalRequestController } from "./rentalRequest.controller";

const router = Router();

router.post(
  "/",
  auth(Role.TENANT),
  validateRequest(rentalRequestValidation.createRentalRequestValidationSchema),
  rentalRequestController.createRentalRequest,
);

router.get(
  "/my-requests",
  auth(Role.TENANT),
  rentalRequestController.getMyRentalRequests,
);

// landlord
router.get(
  "/landlord-requests",
  auth(Role.LANDLORD),
  rentalRequestController.getLandlordRentalRequests,
);

router.patch(
  "/:id",
  auth(Role.LANDLORD),
  validateRequest(rentalRequestValidation.updateStatusValidationSchema),
  rentalRequestController.updateRentalRequestStatus,
);

// shared
router.get(
  "/:id",
  auth(Role.TENANT, Role.LANDLORD, Role.ADMIN),
  rentalRequestController.getSingleRentalRequest,
);

export const rentalRequestRoutes = router;
