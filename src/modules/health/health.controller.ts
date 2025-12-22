import { Request, Response } from "express";
import { env } from "@config/env";

export class HealthController {
  async check(req: Request, res: Response): Promise<void> {
    const healthData = {
      status: "ok",
      service: env.APP_NAME,
      version: env.APP_VERSION,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
    };

    res.status(200).json(healthData);
  }
}

export default new HealthController();
