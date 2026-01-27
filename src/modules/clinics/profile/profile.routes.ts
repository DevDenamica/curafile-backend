import { Router } from "express";
import profileController from "./profile.controller";
import { authenticateClinic } from "@shared/middlewares/auth.middleware";

const router = Router();

// Protected routes (require clinic authentication)
router.get(
  "/",
  authenticateClinic,
  profileController.getProfile.bind(profileController),
);

router.put(
  "/",
  authenticateClinic,
  profileController.updateProfile.bind(profileController),
);

// Public route - get clinic profile by ID
router.get(
  "/:clinicId",
  profileController.getProfileByClinicId.bind(profileController),
);

export default router;
