import { Request, Response } from "express";
import invitationService from "./invitation.service";
import {
  inviteDoctorSchema,
  updateDoctorAffiliationSchema,
} from "./invitation.dto";

export class InvitationController {
  // Invite doctor to clinic
  async inviteDoctor(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const data = inviteDoctorSchema.parse(req.body);
    const result = await invitationService.inviteDoctor(userId, data);
    res.status(201).json(result);
  }

  // Get all affiliated doctors
  async getAffiliatedDoctors(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const result = await invitationService.getAffiliatedDoctors(userId);
    res.status(200).json(result);
  }

  // Get pending invitations
  async getPendingInvitations(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const result = await invitationService.getPendingInvitations(userId);
    res.status(200).json(result);
  }

  // Update doctor affiliation
  async updateDoctorAffiliation(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const clinicDoctorId = req.params.clinicDoctorId as string;
    const data = updateDoctorAffiliationSchema.parse(req.body);
    const result = await invitationService.updateDoctorAffiliation(
      userId,
      clinicDoctorId,
      data,
    );
    res.status(200).json(result);
  }

  // Cancel invitation
  async cancelInvitation(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const clinicDoctorId = req.params.clinicDoctorId as string;
    const result = await invitationService.cancelInvitation(
      userId,
      clinicDoctorId,
    );
    res.status(200).json(result);
  }

  // Remove doctor from clinic
  async removeDoctorFromClinic(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const clinicDoctorId = req.params.clinicDoctorId as string;
    const result = await invitationService.removeDoctorFromClinic(
      userId,
      clinicDoctorId,
    );
    res.status(200).json(result);
  }
}

export default new InvitationController();
