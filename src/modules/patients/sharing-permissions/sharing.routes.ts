import { Router } from "express";
import sharingController from "./sharing.controller";
import { authenticatePatient } from "@shared/middlewares/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticatePatient);

router.post(
  "/",
  sharingController.createSharingPermission.bind(sharingController),
);
// Permissions I have granted to others
router.get(
  "/",
  sharingController.getSharingPermissions.bind(sharingController),
);
// Permissions others have granted to me
router.get(
  "/received",
  sharingController.getReceivedPermissions.bind(sharingController),
);
router.patch(
  "/:permissionId",
  sharingController.updateSharingPermission.bind(sharingController),
);
router.delete(
  "/:permissionId",
  sharingController.revokeSharingPermission.bind(sharingController),
);

export default router;
