import { Request, Response } from "express";
import logoutService from "./logout.service";
import { UnauthorizedError } from "@shared/exceptions/AppError";

export class LogoutController {
  async logout(req: Request, res: Response): Promise<void> {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }

    const token = authHeader.substring(7);
    const result = await logoutService.logout(token);

    res.status(200).json(result);
  }

  async logoutAllDevices(req: Request, res: Response): Promise<void> {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }

    const token = authHeader.substring(7);
    const result = await logoutService.logoutAllDevices(token);

    res.status(200).json(result);
  }
}

export default new LogoutController();
