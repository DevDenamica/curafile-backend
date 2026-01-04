import { Router } from "express";
import authRoutes from "./auth/auth.routes";
import profileRoutes from "./profile/profile.routes";
import passwordRoutes from "./password/password.routes";
import accountRoutes from "./account/account.routes";

const router = Router();

// Mount feature routes
router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/password", passwordRoutes);
router.use("/account", accountRoutes);

export default router;
