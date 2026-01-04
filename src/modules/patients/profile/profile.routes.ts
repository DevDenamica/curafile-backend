import { Router } from "express";
import profileController from "./profile.controller";
import { authenticatePatient } from "@shared/middlewares/auth.middleware";

const router = Router();

// Protected profile routes
router.get("/", authenticatePatient, profileController.getProfile.bind(profileController));
router.put("/", authenticatePatient, profileController.updateProfile.bind(profileController));

export default router;
