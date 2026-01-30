import { Router } from "express";
import authRoutes from "./auth/auth.routes";
import profileRoutes from "./profile/profile.routes";
import invitationRoutes from "./invitations/invitation.routes";

const router = Router();

// Mount feature routes
router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/invitation", invitationRoutes);

export default router;
