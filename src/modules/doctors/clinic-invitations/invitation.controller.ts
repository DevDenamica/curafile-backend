import { Request, Response } from "express";
import invitationService from "./invitation.service";

export class DoctorInvitationController {
  // Get pending invitations
  async getPendingInvitations(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const result = await invitationService.getPendingInvitations(userId);
    res.status(200).json(result);
  }

  // Accept invitation
  async acceptInvitation(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const clinicDoctorId = req.params.clinicDoctorId as string;
    const result = await invitationService.acceptInvitation(
      userId,
      clinicDoctorId,
    );
    res.status(200).json(result);
  }

  // Reject invitation
  async rejectInvitation(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const clinicDoctorId = req.params.clinicDoctorId as string;
    const result = await invitationService.rejectInvitation(
      userId,
      clinicDoctorId,
    );
    res.status(200).json(result);
  }

  // Get my clinics
  async getMyClinics(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const result = await invitationService.getMyClinics(userId);
    res.status(200).json(result);
  }

  // Leave clinic
  async leaveClinic(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const clinicDoctorId = req.params.clinicDoctorId as string;
    const result = await invitationService.leaveClinic(userId, clinicDoctorId);
    res.status(200).json(result);
  }
}

export default new DoctorInvitationController();
