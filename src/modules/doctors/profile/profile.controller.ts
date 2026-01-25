import { Request, Response } from "express";
import profileService from "./profile.service";
import { updateDoctorProfileSchema } from "./profile.dto";

export class DoctorProfileController {
  // GET /api/doctors/profile = Get own profile
  async getProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const profile = await profileService.getProfile(userId);
    res.status(200).json(profile);
  }

  // PUT /api/doctors/profile - Update own profile
  async updateProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const data = updateDoctorProfileSchema.parse(req.body);
    const profile = await profileService.updateProfile(userId, data);
    res.status(200).json(profile);
  }

  // GET /api/doctors/profile/:doctorId - Get doctor by ID (public)
  async getProfileByDoctorId(req: Request, res: Response): Promise<void> {
    const doctorId = req.params.doctorId as string;
    const profile = await profileService.getProfileByDoctorId(doctorId);
    res.status(200).json(profile);
  }
}
export default new DoctorProfileController();
