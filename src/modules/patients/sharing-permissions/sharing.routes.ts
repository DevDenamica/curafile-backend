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
router.get(
  "/",
  sharingController.getSharingPermissions.bind(sharingController),
);
router.delete(
  "/:permissionId",
  sharingController.revokeSharingPermission.bind(sharingController),
);

export default router;
