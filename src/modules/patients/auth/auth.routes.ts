import { Router } from "express";
import authController from "./auth.controller";
import logoutController from "./logout.controller";
import { authenticatePatient } from "@shared/middlewares/auth.middleware";

const router = Router();

// Public authentication routes
router.post("/send-otp", authController.sendOtp.bind(authController));
router.post("/verify-otp", authController.verifyOtp.bind(authController));
router.post(
  "/complete-registration",
  authController.completeRegistration.bind(authController)
);
router.post("/accept-terms", authController.acceptTerms.bind(authController));
router.post("/login", authController.login.bind(authController));

// Protected logout routes (require authentication)
router.post(
  "/logout",
  authenticatePatient,
  logoutController.logout.bind(logoutController)
);
router.post(
  "/logout-all",
  authenticatePatient,
  logoutController.logoutAllDevices.bind(logoutController)
);

export default router;
