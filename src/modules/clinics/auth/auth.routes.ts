import { Router } from "express";
import authController from "./auth.controller";
import { authenticateClinic } from "@shared/middlewares/auth.middleware";
import logoutController from "./logout.controller";

const router = Router();

// Public authentication routes
router.post("/register", authController.register.bind(authController));
router.post("/verify-email", authController.verifyEmail.bind(authController));
router.post(
  "/resend-verification",
  authController.resendVerification.bind(authController),
);
router.post("/login", authController.login.bind(authController));
router.post(
  "/forgot-password",
  authController.forgotPassword.bind(authController),
);
router.post(
  "/reset-password",
  authController.resetPassword.bind(authController),
);

router.post(
  "/logout",
  authenticateClinic,
  logoutController.logout.bind(logoutController),
);
router.post(
  "/logout-all",
  authenticateClinic,
  logoutController.logoutAllDevices.bind(logoutController),
);

export default router;
