import { Router } from "express";
import { userController } from "./user.controller";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { userValidation } from "./user.validation";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get("/test", (req, res) => {
  res.json({ message: "User route working" });
});

router.post(
  "/register",
  validateRequest(userValidation.registerValidationSchema),
  userController.registerUser,
);

router.get(
  "/me",
  auth(Role.ADMIN, Role.TENANT, Role.LANDLORD),
  userController.getMyProfile,
);

router.put(
  "/my-profile",
  auth(Role.ADMIN, Role.TENANT, Role.LANDLORD),
  validateRequest(userValidation.updateProfileValidationSchema),
  userController.updateMyProfile,
);

export const userRoutes = router;
