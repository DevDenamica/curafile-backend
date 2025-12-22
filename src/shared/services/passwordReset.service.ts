import { randomBytes } from 'crypto';
import prisma from '@config/database';
import { env } from '@config/env';

export class PasswordResetService {
  // Generate a secure random reset token
  private generateResetToken(): string {
    return randomBytes(32).toString('hex'); // 64 characters
  }

  // Create and store password reset token
  async createResetToken(email: string): Promise<string> {
    const token = this.generateResetToken();
    const expiryMinutes = parseInt(env.OTP_EXPIRY_MINUTES); // Reuse OTP expiry setting
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Invalidate any previous unused tokens for this email
    await prisma.passwordResetToken.updateMany({
      where: {
        email,
        used: false,
      },
      data: {
        expiresAt: new Date(0), // Expire immediately
      },
    });

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        token,
        email,
        expiresAt,
      },
    });

    return token;
  }

  // Verify if reset token is valid
  async verifyResetToken(token: string): Promise<{ valid: boolean; email?: string }> {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return { valid: false };
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      return { valid: false };
    }

    // Check if token was already used
    if (resetToken.used) {
      return { valid: false };
    }

    return { valid: true, email: resetToken.email };
  }

  // Mark token as used after successful password reset
  async markTokenAsUsed(token: string): Promise<void> {
    await prisma.passwordResetToken.update({
      where: { token },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });
  }

  // Invalidate all tokens for an email
  async invalidateAllTokens(email: string): Promise<void> {
    await prisma.passwordResetToken.updateMany({
      where: { email },
      data: {
        expiresAt: new Date(0),
      },
    });
  }
}

export default new PasswordResetService();
