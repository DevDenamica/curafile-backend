import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "@config/env";
import authRepository, { CreateClinicData } from "./auth.repository";
import otpService from "@shared/services/otp.service";
import passwordResetService from "@shared/services/passwordReset.service";
import emailService from "@shared/services/email.service";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} from "@shared/exceptions/AppError";
import logger from "@shared/utils/logger";
import {
  RegisterClinicDto,
  LoginClinicDto,
  VerifyEmailDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from "./auth.dto";

export class ClinicAuthService {
  async register(data: RegisterClinicDto): Promise<{ message: string }> {
    try {
      // Check if email exists
      const existingUser = await authRepository.findByEmail(data.email);

      if (existingUser) {
        // Check if already has clinic
        if (existingUser.clinicsOwned && existingUser.clinicsOwned.length > 0) {
          throw new ConflictError("This email already has a registered clinic");
        }

        // Check if user has clinic staff role
        const hasClinicRole = await authRepository.hasClinicStaffRole(
          existingUser.id,
        );
        if (hasClinicRole) {
          throw new ConflictError(
            "This email is already registered as clinic staff",
          );
        }

        throw new ConflictError("Email already registered");
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 10);

      // Create clinic and user
      const createData: CreateClinicData = {
        email: data.email,
        passwordHash,
        clinicName: data.clinicName || "",
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country,
        licenseNumber: data.licenseNumber,
        specializations: data.specializations,
      };

      const { user, clinic } = await authRepository.createClinic(createData);

      // Send verification OTP
      await otpService.sendEmailVerificationOTP(data.email);

      logger.info(`Clinic registered: ${clinic.name} (${clinic.id})`);

      return {
        message: "Registration successful. Please verify your email.",
      };
    } catch (error: any) {
      logger.error("Error registering clinic:", error.message);
      throw error;
    }
  }

  async verifyEmail(data: VerifyEmailDto): Promise<{
    message: string;
    token: string;
    clinic: {
      id: string;
      name: string;
      isVerified: boolean;
    } | null;
  }> {
    try {
      const user = await authRepository.findByEmail(data.email);

      if (!user) {
        throw new NotFoundError("Clinic not found");
      }

      if (user.isEmailVerified) {
        throw new BadRequestError("Email already verified");
      }

      // Verify OTP
      const isValid = await otpService.verifyEmailOTP(data.email, data.otp);

      if (!isValid) {
        throw new BadRequestError("Invalid or expired verification code");
      }

      // Mark email as verified
      await authRepository.verifyEmail(user.id);

      // Generate token
      const token = this.generateToken(user.id, user.email, "CLINIC_STAFF");

      const clinic = user.clinicsOwned?.[0];

      logger.info(`Clinic email verified: ${data.email}`);

      return {
        message: "Email verified successfully",
        token,
        clinic: clinic
          ? {
              id: clinic.id,
              name: clinic.name,
              isVerified: clinic.isVerified,
            }
          : null,
      };
    } catch (error: any) {
      logger.error("Error verifying email:", error.message);
      throw error;
    }
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    try {
      const user = await authRepository.findByEmail(email);

      if (!user) {
        throw new NotFoundError("Clinic not found");
      }

      if (user.isEmailVerified) {
        throw new BadRequestError("Email already verified");
      }

      await otpService.sendEmailVerificationOTP(email);

      logger.info(`Verification OTP resent to: ${email}`);
      return { message: "Verification code sent successfully" };
    } catch (error: any) {
      logger.error("Error resending verification:", error.message);
      throw error;
    }
  }

  async login(data: LoginClinicDto): Promise<{
    message: string;
    token: string;
    clinic: {
      id: string;
      name: string;
      isVerified: boolean;
    };
  }> {
    try {
      const user = await authRepository.findByEmail(data.email);

      if (!user) {
        throw new UnauthorizedError("Invalid email or password");
      }

      // Check if has clinic staff role
      const hasClinicRole = await authRepository.hasClinicStaffRole(user.id);
      if (!hasClinicRole) {
        throw new UnauthorizedError(
          "This account is not registered as a clinic",
        );
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        data.password,
        user.passwordHash,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedError("Invalid email or password");
      }

      // Check if email is verified
      if (!user.isEmailVerified) {
        throw new BadRequestError("Please verify your email before logging in");
      }

      // Check if user is active
      if (!user.isActive || user.isDeleted) {
        throw new UnauthorizedError(
          "Account is inactive. Please contact support.",
        );
      }

      // Get clinic
      const clinic = user.clinicsOwned?.[0];

      if (!clinic) {
        throw new NotFoundError("No clinic found for this account");
      }

      if (!clinic.isActive) {
        throw new UnauthorizedError(
          "Clinic is inactive. Please contact support.",
        );
      }

      // Generate token
      const token = this.generateToken(user.id, user.email, "CLINIC_STAFF");

      logger.info(`Clinic login: ${data.email}`);

      return {
        message: "Login successful",
        token,
        clinic: {
          id: clinic.id,
          name: clinic.name,
          isVerified: clinic.isVerified,
        },
      };
    } catch (error: any) {
      logger.error("Error logging in clinic:", error.message);
      throw error;
    }
  }

  async forgotPassword(data: ForgotPasswordDto): Promise<{ message: string }> {
    try {
      const user = await authRepository.findByEmail(data.email);

      if (!user) {
        // Don't reveal if email exists
        return {
          message: "If the email exists, a password reset link will be sent",
        };
      }

      // Check if has clinic role
      const hasClinicRole = await authRepository.hasClinicStaffRole(user.id);
      if (!hasClinicRole) {
        return {
          message: "If the email exists, a password reset link will be sent",
        };
      }

      // Create reset token
      const resetToken = await passwordResetService.createResetToken(
        data.email,
      );

      // Send reset email
      await emailService.sendPasswordResetLink(data.email, resetToken);

      logger.info(`Password reset requested for clinic: ${data.email}`);

      return { message: "If the email exists, a reset link will be sent" };
    } catch (error: any) {
      logger.error("Error in forgot password:", error.message);
      throw error;
    }
  }

  async resetPassword(data: ResetPasswordDto): Promise<{ message: string }> {
    try {
      // Verify token
      const tokenData = await passwordResetService.verifyResetToken(data.token);
      if (!tokenData.valid || !tokenData.email) {
        throw new BadRequestError("Invalid or expired reset token");
      }

      const user = await authRepository.findByEmail(tokenData.email);
      if (!user) {
        throw new NotFoundError("User not found");
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(data.newPassword, 10);

      // Update password
      await authRepository.updatePassword(user.id, passwordHash);

      // Mark token as used
      await passwordResetService.markTokenAsUsed(data.token);

      logger.info(`Password reset successful for: ${tokenData.email}`);
      return { message: "Password reset successful" };
    } catch (error: any) {
      logger.error("Error resetting password:", error.message);
      throw error;
    }
  }

  private generateToken(userId: string, email: string, role: string): string {
    return jwt.sign({ id: userId, email, role }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  }
}

export default new ClinicAuthService();
