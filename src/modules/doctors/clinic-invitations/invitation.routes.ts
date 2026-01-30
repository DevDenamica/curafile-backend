import { Router } from "express";
import invitationController from "./invitation.controller";
import { authenticateDoctor } from "@shared/middlewares/auth.middleware";

const router = Router();

// All routes require doctor authentication

// Get pending invitations
router.get(
  "/pending",
  authenticateDoctor,
  invitationController.getPendingInvitations.bind(invitationController),
);

// Accept invitation
router.post(
  "/:clinicDoctorId/accept",
  authenticateDoctor,
  invitationController.acceptInvitation.bind(invitationController),
);

// Reject invitation
router.post(
  "/:clinicDoctorId/reject",
  authenticateDoctor,
  invitationController.rejectInvitation.bind(invitationController),
);

// Get my affiliated clinics
router.get(
  "/my-clinics",
  authenticateDoctor,
  invitationController.getMyClinics.bind(invitationController),
);

// Leave clinic
router.delete(
  "/:clinicDoctorId/leave",
  authenticateDoctor,
  invitationController.leaveClinic.bind(invitationController),
);

export default router;
