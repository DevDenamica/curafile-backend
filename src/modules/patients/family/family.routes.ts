import { Router } from "express";
import familyController from "./family.controller";
import { authenticatePatient } from "@shared/middlewares/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticatePatient);

router.post("/", familyController.addFamilyMember.bind(familyController));
router.get("/", familyController.getFamilyMembers.bind(familyController));
router.patch(
  "/:relationId",
  familyController.updateFamilyMemberPermissions.bind(familyController),
);
router.delete(
  "/:relationId",
  familyController.removeFamilyMember.bind(familyController),
);

export default router;
