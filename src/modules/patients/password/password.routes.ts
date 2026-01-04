import { Router } from "express";
import passwordController from "./password.controller";
import { authenticatePatient } from "@shared/middlewares/auth.middleware";

const router = Router();

// Protected password routes
router.put(
  "/change-password",
  authenticatePatient,
  passwordController.changePassword.bind(passwordController)
);

// Public password reset routes
router.post(
  "/forgot-password",
  passwordController.forgotPassword.bind(passwordController)
);
router.get(
  "/verify-reset-token",
  passwordController.verifyResetToken.bind(passwordController)
);
router.post(
  "/reset-password",
  passwordController.resetPassword.bind(passwordController)
);

export default router;
