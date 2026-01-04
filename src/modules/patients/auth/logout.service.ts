import prisma from "@config/database";
import jwt from "jsonwebtoken";
import { env } from "@config/env";
import { UnauthorizedError } from "@shared/exceptions/AppError";
import logger from "@shared/utils/logger";

/**
 * LogoutService handles token blacklisting for server-side logout.
 * JWT tokens are stateless and can't be invalidated by default.
 * This service maintains a blacklist of invalidated tokens in the database.
 */
export class LogoutService {
  /**
   * Extract patient ID (UUID) from JWT token
   * Note: Returns 'id' field (UUID), not 'patientId' (display ID like PAT-000001)
   */
  private extractPatientId(token: string): string {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
      return decoded.id;
    } catch (error) {
      throw new UnauthorizedError("Invalid token");
    }
  }

  /**
   * Get token expiration date for cleanup purposes
   * Used to automatically remove blacklist entries after token expires
   */
  private getTokenExpiry(token: string): Date {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { exp: number };
      return new Date(decoded.exp * 1000); // JWT exp is in seconds, Date needs milliseconds
    } catch (error) {
      throw new UnauthorizedError("Invalid token");
    }
  }

  /**
   * Logout from single device
   * Adds token to blacklist, other devices remain logged in
   */
  async logout(token: string): Promise<{ message: string }> {
    const patientId = this.extractPatientId(token);
    const expiresAt = this.getTokenExpiry(token);

    await prisma.tokenBlacklist.create({
      data: {
        token,
        patientId,
        reason: "LOGOUT",
        expiresAt,
      },
    });

    logger.info(`Patient ${patientId} logged out from single device`);

    return {
      message: "Logged out successfully",
    };
  }

  /**
   * Logout from all devices
   * Creates blacklist entry that invalidates all tokens for this patient
   */
  async logoutAllDevices(token: string): Promise<{ message: string }> {
    const patientId = this.extractPatientId(token);

    await prisma.tokenBlacklist.create({
      data: {
        token,
        patientId,
        reason: "LOGOUT_ALL_DEVICES",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days (max JWT lifetime)
      },
    });

    logger.warn(
      `Patient ${patientId} logged out from ALL devices (security action)`
    );

    return {
      message: "Logged out from all devices successfully",
    };
  }

  /**
   * Check if token is blacklisted
   * Called by authentication middleware on every request
   *
   * Checks:
   * 1. Direct blacklist: This exact token was blacklisted
   * 2. Logout all: Patient has LOGOUT_ALL_DEVICES entry created after token was issued
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const patientId = this.extractPatientId(token);
      const decoded = jwt.verify(token, env.JWT_SECRET) as { iat: number };
      const tokenIssuedAt = new Date(decoded.iat * 1000);

      // Check if this exact token is blacklisted
      const directBlacklist = await prisma.tokenBlacklist.findUnique({
        where: { token },
      });

      if (directBlacklist) {
        return true;
      }

      // Check if patient logged out from all devices after this token was issued
      const logoutAllAction = await prisma.tokenBlacklist.findFirst({
        where: {
          patientId,
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
      // Treat invalid tokens as blacklisted for security
      return true;
    }
  }

  /**
   * Cleanup expired blacklist entries
   * Should be called by background cron job (not HTTP endpoint)
   * Removes entries where token has already expired
   */
  async cleanupExpiredTokens(): Promise<{ deletedCount: number }> {
    const result = await prisma.tokenBlacklist.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    logger.info(`Cleaned up ${result.count} expired tokens from blacklist`);

    return { deletedCount: result.count };
  }

  /**
   * Invalidate all tokens for a patient
   * Used for security events: password change, account deactivation, etc.
   */
  async invalidateAllTokensForPatient(
    patientId: string,
    reason: "PASSWORD_CHANGED" | "ACCOUNT_DEACTIVATED" | "SECURITY"
  ): Promise<void> {
    await prisma.tokenBlacklist.create({
      data: {
        token: `INVALIDATE_ALL_${patientId}_${Date.now()}`,
        patientId,
        reason,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    logger.warn(
      `All tokens invalidated for patient ${patientId}. Reason: ${reason}`
    );
  }
}

export default new LogoutService();
