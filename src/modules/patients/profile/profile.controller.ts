import { Request, Response } from "express";
import profileService from "./profile.service";
import { updatePatientProfileSchema } from "./profile.dto";

export class ProfileController {
  // GET /api/patients/profile
  async getProfile(req: Request, res: Response): Promise<void> {
    const patientId = req.user?.id!; // Will be set by auth middleware
    const result = await profileService.getProfile(patientId);
    res.status(200).json(result);
  }

  // PUT /api/patients/profile
  async updateProfile(req: Request, res: Response): Promise<void> {
    const patientId = req.user?.id!; // Will be set by auth middleware
    const data = updatePatientProfileSchema.parse(req.body);
    const result = await profileService.updateProfile(patientId, data);
    res.status(200).json(result);
  }
}

export default new ProfileController();
