import { Router } from "express";
import authRoutes from "./auth/auth.routes";
import profileRoutes from "./profile/profile.routes";
import clinicInvitationRoutes from "./clinic-invitations/invitation.routes";

const router = Router();

// Mount feature routes
router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/clinic-invitations", clinicInvitationRoutes);

export default router;
