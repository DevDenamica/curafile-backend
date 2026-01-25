import { Request, Response } from "express";
import authService from "./auth.service";
import {
  registerDoctorSchema,
  loginDoctorSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.dto";

export class DoctorAuthController {
  async register(req: Request, res: Response): Promise<void> {
    const data = registerDoctorSchema.parse(req.body);
    const result = await authService.register(data);
    res.status(201).json(result);
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    const data = verifyEmailSchema.parse(req.body);
    const result = await authService.verifyEmail(data);
    res.status(200).json(result);
  }

  async resendVerification(req: Request, res: Response): Promise<void> {
    const data = resendVerificationSchema.parse(req.body);
    const result = await authService.resendVerification(data.email);
    res.status(200).json(result);
  }

  async login(req: Request, res: Response): Promise<void> {
    const data = loginDoctorSchema.parse(req.body);
    const result = await authService.login(data);
    res.status(200).json(result);
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const data = forgotPasswordSchema.parse(req.body);
    const result = await authService.forgotPassword(data);
    res.status(200).json(result);
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    const data = resetPasswordSchema.parse(req.body);
    const result = await authService.resetPassword(data);
    res.status(200).json(result);
  }
}

export default new DoctorAuthController();
