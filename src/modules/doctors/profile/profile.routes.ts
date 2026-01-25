import { Router } from "express";
import profileController from "./profile.controller";
import { authenticateDoctor } from "@/shared/middlewares/auth.middleware";

const router = Router();

// Protected router (require doctor authentication)
router.get(
  "/",
  authenticateDoctor,
  profileController.getProfile.bind(profileController),
);

router.put(
  "/",
  authenticateDoctor,
  profileController.updateProfile.bind(profileController),
);

// Public route - get doctor by ID
router.get(
  "/:doctorId",
  profileController.getProfileByDoctorId.bind(profileController),
);

export default router;
