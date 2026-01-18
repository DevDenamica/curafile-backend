import { Request, Response } from "express";
import profileService from "./profile.service";
import { updatePatientProfileSchema } from "./profile.dto";

export class ProfileController {
  async getProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const result = await profileService.getProfile(userId);
    res.status(200).json(result);
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const data = updatePatientProfileSchema.parse(req.body);
    const result = await profileService.updateProfile(userId, data);
    res.status(200).json(result);
  }
}

export default new ProfileController();
