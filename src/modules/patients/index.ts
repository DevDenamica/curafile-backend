import { Router } from "express";
import authRoutes from "./auth/auth.routes";
import profileRoutes from "./profile/profile.routes";
import passwordRoutes from "./password/password.routes";
import accountRoutes from "./account/account.routes";
import vaccinationsRoutes from "./vaccinations/vaccinations.routes";
import documentsRoutes from "./documents/documents.routes";
import familyRoutes from "./family/family.routes";
import sharingRoutes from "./sharing-permissions/sharing.routes";

const router = Router();

// Mount feature routes
router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/password", passwordRoutes);
router.use("/account", accountRoutes);
router.use("/vaccinations", vaccinationsRoutes);
router.use("/documents", documentsRoutes);
router.use("/family", familyRoutes);
router.use("/sharing-permission", sharingRoutes);

export default router;
