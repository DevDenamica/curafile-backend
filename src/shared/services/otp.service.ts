import prisma from "@config/database";
import { env } from "@config/env";
import emailService from "./email.service";

export class OtpService {
  private generateOTP(): string {
    // Generate 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendEmailVerificationOTP(email: string): Promise<void> {
    // Generate new OTP
    const code = this.generateOTP();
    const expiryMinutes = parseInt(env.OTP_EXPIRY_MINUTES);
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Invalidate any previous OTPs for this email
    await prisma.otpCode.updateMany({
      where: {
        email,
        type: "EMAIL_VERIFICATION",
        verified: false,
      },
      data: {
        verified: true, // Mark as used
      },
    });

    // Create new OTP record
    await prisma.otpCode.create({
      data: {
        email,
        code,
        type: "EMAIL_VERIFICATION",
        expiresAt,
      },
    });

    // Send email
    await emailService.sendOTP(email, code);
  }

  async verifyEmailOTP(email: string, code: string): Promise<boolean> {
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        email,
        code,
        type: "EMAIL_VERIFICATION",
        verified: false,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!otpRecord) {
      return false;
    }

    // Mark OTP as verified
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    return true;
  }

  async hasVerifiedEmail(email: string): Promise<boolean> {
    const verifiedOtp = await prisma.otpCode.findFirst({
      where: {
        email,
        type: "EMAIL_VERIFICATION",
        verified: true,
      },
    });

    return !!verifiedOtp;
  }

  async sendPasswordResetOTP(email: string): Promise<void> {
    // Generate new OTP
    const code = this.generateOTP();
    const expiryMinutes = parseInt(env.OTP_EXPIRY_MINUTES);
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Invalidate any previous OTPs for this email
    await prisma.otpCode.updateMany({
      where: {
        email,
        type: "PASSWORD_RESET",
        verified: false,
      },
      data: {
        verified: true,
      },
    });

    // Create new OTP record
    await prisma.otpCode.create({
      data: {
        email,
        code,
        type: "PASSWORD_RESET",
        expiresAt,
      },
    });

    // Send email
    await emailService.sendOTP(email, code);
  }

  async verifyPasswordResetOTP(email: string, code: string): Promise<boolean> {
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        email,
        code,
        type: "PASSWORD_RESET",
        verified: false,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!otpRecord) {
      return false;
    }

    // Mark OTP as verified
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    return true;
  }

  async hasVerifiedPasswordResetOTP(
    email: string,
    code: string
  ): Promise<boolean> {
    const verifiedOtp = await prisma.otpCode.findFirst({
      where: {
        email,
        code,
        type: "PASSWORD_RESET",
        verified: true,
        expiresAt: {
          gte: new Date(),
        },
      },
    });
    return !!verifiedOtp;
  }

  async invalidateAllOTPs(email: string, code: string): Promise<void> {
    await prisma.otpCode.updateMany({
      where: {
        email,
        code,
        type: "PASSWORD_RESET",
      },
      data: {
        expiresAt: new Date(0), // Set expiry to now
      },
    });
  }
}

export default new OtpService();
