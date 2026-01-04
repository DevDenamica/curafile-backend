import { Request, Response } from "express";
import passwordService from "./password.service";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  verifyResetTokenSchema,
  resetPasswordSchema,
} from "./password.dto";

export class PasswordController {
  // PUT /api/patients/password/change-password
  async changePassword(req: Request, res: Response): Promise<void> {
    const patientId = req.user?.id!; // Will be set by auth middleware
    const data = changePasswordSchema.parse(req.body);
    const result = await passwordService.changePassword(patientId, data);
    res.status(200).json(result);
  }

  // POST /api/patients/password/forgot-password
  async forgotPassword(req: Request, res: Response): Promise<void> {
    const data = forgotPasswordSchema.parse(req.body);
    const result = await passwordService.forgotPassword(data);
    res.status(200).json(result);
  }

  // GET /api/patients/password/verify-reset-token?token=xxx (optional - for frontend validation)
  async verifyResetToken(req: Request, res: Response): Promise<void> {
    const data = verifyResetTokenSchema.parse({ token: req.query.token });
    const result = await passwordService.verifyResetToken(data.token);
    res.status(200).json(result);
  }

  // POST /api/patients/password/reset-password
  async resetPassword(req: Request, res: Response): Promise<void> {
    const data = resetPasswordSchema.parse(req.body);
    const result = await passwordService.resetPassword(data);
    res.status(200).json(result);
  }
}

export default new PasswordController();
