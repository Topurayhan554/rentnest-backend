import { Router } from "express";
import { paymentController } from "./payment.controller";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { paymentValidation } from "./payment.validation";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/confirm", paymentController.confirmPayment);

router.post(
  "/create",
  auth(Role.TENANT),
  validateRequest(paymentValidation.createPaymentValidationSchema),
  paymentController.createPayment,
);
router.get("/", auth(Role.TENANT, Role.ADMIN), paymentController.getMyPayments);
router.get(
  "/:id",
  auth(Role.TENANT, Role.LANDLORD, Role.ADMIN),
  paymentController.getSinglePayment,
);

export const paymentRoutes = router;
