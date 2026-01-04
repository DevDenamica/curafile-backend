import { Request, Response } from "express";
import authService from "./auth.service";
import {
  sendOtpSchema,
  verifyOtpSchema,
  completeRegistrationSchema,
  acceptTermsSchema,
  loginSchema,
} from "./auth.dto";

export class AuthController {
  // POST /api/patients/auth/send-otp
  async sendOtp(req: Request, res: Response): Promise<void> {
    const data = sendOtpSchema.parse(req.body);
    const result = await authService.sendOtp(data);
    res.status(200).json(result);
  }

  // POST /api/patients/auth/verify-otp
  async verifyOtp(req: Request, res: Response): Promise<void> {
    const data = verifyOtpSchema.parse(req.body);
    const result = await authService.verifyOtp(data);
    res.status(200).json(result);
  }

  // POST /api/patients/auth/complete-registration
  async completeRegistration(req: Request, res: Response): Promise<void> {
    const data = completeRegistrationSchema.parse(req.body);
    const result = await authService.completeRegistration(data);
    res.status(201).json(result);
  }

  // POST /api/patients/auth/accept-terms
  async acceptTerms(req: Request, res: Response): Promise<void> {
    const data = acceptTermsSchema.parse(req.body);
    const result = await authService.acceptTerms(data);
    res.status(200).json(result);
  }

  // POST /api/patients/auth/login
  async login(req: Request, res: Response): Promise<void> {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);
    res.status(200).json(result);
  }
}

export default new AuthController();
