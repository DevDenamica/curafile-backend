import { Request, Response } from "express";
import accountService from "./account.service";

export class AccountController {
  // POST /api/patients/account/deactivate
  async deactivateAccount(req: Request, res: Response): Promise<void> {
    const patientId = req.user?.id!; // Will be set by auth middleware
    const { password } = req.body;
    const result = await accountService.deactivateAccount(patientId, password);
    res.status(200).json(result);
  }
}

export default new AccountController();
