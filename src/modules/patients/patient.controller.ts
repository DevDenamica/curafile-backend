import { Request, Response } from "express";
import patientService from "./patient.service";
import {
  sendOtpSchema,
  verifyOtpSchema,
  completeRegistrationSchema,
  acceptTermsSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyResetTokenSchema,
  resetPasswordSchema,
} from "./patient.dto";

export class PatientController {
  // POST /api/patients/auth/send-otp
  async sendOtp(req: Request, res: Response): Promise<void> {
    const data = sendOtpSchema.parse(req.body);
    const result = await patientService.sendOtp(data);
    res.status(200).json(result);
  }

  // POST /api/patients/auth/verify-otp
  async verifyOtp(req: Request, res: Response): Promise<void> {
    const data = verifyOtpSchema.parse(req.body);
    const result = await patientService.verifyOtp(data);
    res.status(200).json(result);
  }

  // POST /api/patients/auth/complete-registration
  async completeRegistration(req: Request, res: Response): Promise<void> {
    const data = completeRegistrationSchema.parse(req.body);
    const result = await patientService.completeRegistration(data);
    res.status(201).json(result);
  }

  // POST /api/patients/auth/accept-terms
  async acceptTerms(req: Request, res: Response): Promise<void> {
    const data = acceptTermsSchema.parse(req.body);
    const result = await patientService.acceptTerms(data);
    res.status(200).json(result);
  }

  // POST /api/patients/auth/login
  async login(req: Request, res: Response): Promise<void> {
    const data = loginSchema.parse(req.body);
    const result = await patientService.login(data);
    res.status(200).json(result);
  }

  // GET /api/patients/profile
  async getProfile(req: Request, res: Response): Promise<void> {
    const patientId = req.user?.id!; // Will be set by auth middleware
    const result = await patientService.getProfile(patientId);
    res.status(200).json(result);
  }

  // POST /api/patients/auth/forgot-password
  async forgotPassword(req: Request, res: Response): Promise<void> {
    const data = forgotPasswordSchema.parse(req.body);
    const result = await patientService.forgotPassword(data);
    res.status(200).json(result);
  }

  // GET /api/patients/auth/verify-reset-token?token=xxx (optional - for frontend validation)
  async verifyResetToken(req: Request, res: Response): Promise<void> {
    const data = verifyResetTokenSchema.parse({ token: req.query.token });
    const result = await patientService.verifyResetToken(data.token);
    res.status(200).json(result);
  }

  // POST /api/patients/auth/restore-password
  async resetPassword(req: Request, res: Response): Promise<void> {
    const data = resetPasswordSchema.parse(req.body);
    const result = await patientService.resetPassword(data);
    res.status(200).json(result);
  }
}

export default new PatientController();
