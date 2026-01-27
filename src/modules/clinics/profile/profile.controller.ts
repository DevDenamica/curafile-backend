import { Request, Response } from "express";
import profileService from "./profile.service";
import { updateClinicProfileSchema } from "./profile.dto";

export class ClinicProfileController {
  // Get authenticated clinic's own profile
  async getProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const result = await profileService.getProfile(userId);
    res.status(200).json(result);
  }

  // Update authenticated clinic's profile
  async updateProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const data = updateClinicProfileSchema.parse(req.body);
    const result = await profileService.updateProfile(userId, data);
    res.status(200).json(result);
  }

  // Get clinic profile by ID (public)
  async getProfileByClinicId(req: Request, res: Response): Promise<void> {
    const clinicId = req.params.clinicId as string;
    const result = await profileService.getProfile(clinicId);
    res.status(200).json(result);
  }
}

export default new ClinicProfileController();
