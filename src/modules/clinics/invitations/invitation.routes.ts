import { Router } from "express";
import invitationController from "./invitation.controller";
import { authenticateClinic } from "@shared/middlewares/auth.middleware";

const router = Router();

// All routes require authentication
router.post(
  "/invite",
  authenticateClinic,
  invitationController.inviteDoctor.bind(invitationController),
);

router.get(
  "/doctors",
  authenticateClinic,
  invitationController.getAffiliatedDoctors.bind(invitationController),
);

router.get(
  "/pending",
  authenticateClinic,
  invitationController.getPendingInvitations.bind(invitationController),
);

router.put(
  "/:clinicDoctorId",
  authenticateClinic,
  invitationController.updateDoctorAffiliation.bind(invitationController),
);

router.delete(
  "/:clinicDoctorId/cancel",
  authenticateClinic,
  invitationController.cancelInvitation.bind(invitationController),
);

router.delete(
  "/:clinicDoctorId/remove",
  authenticateClinic,
  invitationController.removeDoctorFromClinic.bind(invitationController),
);

export default router;
