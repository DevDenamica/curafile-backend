import { Router } from "express";
import patientController from "./patient.controller";
import { authenticatePatient } from "@shared/middlewares/auth.middleware";

const router = Router();

// Public routes (no authentication required)
router.post(
  "/auth/send-otp",
  patientController.sendOtp.bind(patientController)
);
router.post(
  "/auth/verify-otp",
  patientController.verifyOtp.bind(patientController)
);
router.post(
  "/auth/complete-registration",
  patientController.completeRegistration.bind(patientController)
);
router.post(
  "/auth/accept-terms",
  patientController.acceptTerms.bind(patientController)
);
router.post("/auth/login", patientController.login.bind(patientController));

// Forgot password routes (Reset Link flow)
router.post(
  "/auth/forgot-password",
  patientController.forgotPassword.bind(patientController)
);
router.get(
  "/auth/verify-reset-token",
  patientController.verifyResetToken.bind(patientController)
);
router.post(
  "/auth/reset-password",
  patientController.resetPassword.bind(patientController)
);

// Protected routes (authentication required)
router.get(
  "/profile",
  authenticatePatient,
  patientController.getProfile.bind(patientController)
);

export default router;
