import prisma from "@config/database";
import jwt from "jsonwebtoken";
import { env } from "@config/env";
import { UnauthorizedError } from "@shared/exceptions/AppError";
import logger from "@shared/utils/logger";

export class LogoutService {
  private extractUserId(token: string): string {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
      return decoded.id;
    } catch (error) {
      throw new UnauthorizedError("Invalid token");
    }
  }

  private getTokenExpiry(token: string): Date {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { exp: number };
      return new Date(decoded.exp * 1000);
    } catch (error) {
      throw new UnauthorizedError("Invalid token");
    }
  }

  async logout(token: string): Promise<{ message: string }> {
    const userId = this.extractUserId(token);
    const expiresAt = this.getTokenExpiry(token);

    await prisma.tokenBlacklist.create({
      data: {
        token,
        userId,
        reason: "LOGOUT",
        expiresAt,
      },
    });

    logger.info(`Clinic ${userId} logged out from single device`);

    return {
      message: "Logged out successfully",
    };
  }

  async logoutAllDevices(token: string): Promise<{ message: string }> {
    const userId = this.extractUserId(token);

    await prisma.tokenBlacklist.create({
      data: {
        token,
        userId,
        reason: "LOGOUT_ALL_DEVICES",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    logger.warn(
      `Clinic ${userId} logged out from ALL devices (security action)`,
    );

    return {
      message: "Logged out from all devices successfully",
    };
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const userId = this.extractUserId(token);
      const decoded = jwt.verify(token, env.JWT_SECRET) as { iat: number };
      const tokenIssuedAt = new Date(decoded.iat * 1000);

      const directBlacklist = await prisma.tokenBlacklist.findUnique({
        where: { token },
      });

      if (directBlacklist) {
        return true;
      }

      const logoutAllAction = await prisma.tokenBlacklist.findFirst({
        where: {
          userId,
          reason: "LOGOUT_ALL_DEVICES",
          createdAt: {
            gte: tokenIssuedAt,
          },
        },
      });

      if (logoutAllAction) {
        return true;
      }

      return false;
    } catch (error) {
      return true;
    }
  }
}

export default new LogoutService();
