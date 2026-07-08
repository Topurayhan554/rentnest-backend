import { Router } from "express";
import { authController } from "./auth.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { authValidation } from "./auth.validation";

const router = Router();

router.post(
  "/login",
  validateRequest(authValidation.loginValidationSchema),
  authController.loginUser,
);
router.post("/refresh-token", authController.refreshToken);

export const authRoutes = router;
