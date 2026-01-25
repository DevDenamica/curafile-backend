import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "@config/env";
import authRepository from "./auth.repository";
import otpService from "@shared/services/otp.service";
import passwordResetService from "@shared/services/passwordReset.service";
import emailService from "@shared/services/email.service";
import {
  RegisterDoctorDto,
  LoginDoctorDto,
  VerifyEmailDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  DoctorAuthResponse,
} from "./auth.dto";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "@/shared/exceptions/AppError";
import logger from "@shared/utils/logger";

export class DoctorAuthService {
  // Register a new doctor
  async register(data: RegisterDoctorDto): Promise<{ message: string }> {
    try {
      // Check if email already exists
      const existingUser = await authRepository.findByEmail(data.email);

      // Generate unique doctor ID
      const doctorId = await authRepository.generateDoctorId();

      if (existingUser) {
        // Case 1: User exists and already has doctor profile
        if (existingUser.doctorProfile) {
          throw new ConflictError("You are already registered as a doctor");
        }

        // Case 2: User exists as patient only - add doctor role
        if (existingUser.patientProfile) {
          // Verify password matches their existing account
          const isPasswordValid = await bcrypt.compare(
            data.password,
            existingUser.passwordHash,
          );
          if (!isPasswordValid) {
            throw new UnauthorizedError(
              "Invalid password. Use your existing account password.",
            );
          }

          // Add doctor role to existing user
          await authRepository.addDoctorRoleToExistingUser(existingUser.id, {
            firstName: data.firstName,
            lastName: data.lastName,
            doctorId,
            specialization: data.specialization,
            medicalLicenseNumber: data.medicalLicenseNumber,
          });

          logger.info(
            `Doctor role added to existing patient: ${data.email}`,
          );
          return {
            message:
              "Doctor role added successfully. You can now login as a doctor.",
          };
        }

        // Case 3: User exists but has no profile (shouldn't happen normally)
        throw new ConflictError("Email already registered");
      }

      // Case 4: New user - create from scratch
      const passwordHash = await bcrypt.hash(data.password, 10);

      await authRepository.createDoctor({
        email: data.email,
        phoneNumber: data.phoneNumber,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        doctorId,
        specialization: data.specialization,
        medicalLicenseNumber: data.medicalLicenseNumber,
      });

      // Send verification OTP only for new users
      await otpService.sendEmailVerificationOTP(data.email);

      logger.info(`Doctor registered: ${data.email}`);
      return {
        message: "Registration successful. Please verify your email.",
      };
    } catch (error: any) {
      logger.error("Error registering doctor:", error.message);
      throw error;
    }
  }

  // Verify OTP
  async verifyEmail(data: VerifyEmailDto): Promise<DoctorAuthResponse> {
    try {
      const user = await authRepository.findByEmail(data.email);
      if (!user || !user.doctorProfile) {
        throw new NotFoundError("Doctor not found");
      }

      if (user.isEmailVerified) {
        throw new BadRequestError("Email already verified");
      }

      // Verify OTP
      const isValid = await otpService.verifyEmailOTP(data.email, data.code);
      if (!isValid) {
        throw new BadRequestError("Invalid or expired verification code");
      }

      // Update email verificaion status
      await authRepository.verifyEmail(user.id);

      // Generate token
      const token = this.generateToken(user.id, user.email, "DOCTOR");

      logger.info(`Doctor logged in: ${data.email}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          phoneNumber: user.phoneNumber,
        },
        doctor: {
          id: user.doctorProfile.id,
          doctorId: user.doctorProfile.doctorId,
          firstName: user.doctorProfile.firstName,
          lastName: user.doctorProfile.lastName,
          specialization: user.doctorProfile.specialization,
          isVerified: user.isEmailVerified,
        },
        token,
      };
    } catch (error: any) {
      logger.error("Error logging in doctor:", error.message);
      throw error;
    }
  }

  // Resend verification OTP
  async resendVerification(email: string): Promise<{ message: string }> {
    try {
      const user = await authRepository.findByEmail(email);
      if (!user || !user.doctorProfile) {
        throw new NotFoundError("Doctor not found");
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

  // Login
  async login(data: LoginDoctorDto): Promise<DoctorAuthResponse> {
    try {
      const user = await authRepository.findByEmail(data.email);
      if (!user || !user.doctorProfile) {
        throw new UnauthorizedError("Invalid email or password");
      }

      // Check password
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

      // Generate token
      const token = this.generateToken(user.id, user.email, "DOCTOR");

      logger.info(`Doctor logged in: ${data.email}`);
      return {
        user: {
          id: user.id,
          email: user.email,
          phoneNumber: user.phoneNumber,
        },
        doctor: {
          id: user.doctorProfile.id,
          doctorId: user.doctorProfile.doctorId,
          firstName: user.doctorProfile.firstName,
          lastName: user.doctorProfile.lastName,
          specialization: user.doctorProfile.specialization,
          isVerified: user.isEmailVerified,
        },
        token,
      };
    } catch (error: any) {
      logger.error("Error logging in doctor:", error.message);
      throw error;
    }
  }

  // Forgot password - send reset link
  async forgotPassword(data: ForgotPasswordDto): Promise<{ message: string }> {
    try {
      const user = await authRepository.findByEmail(data.email);
      if (!user || !user.doctorProfile) {
        // Don't reveal if email exists
        return { message: "If the email exists, a reset link will be sent" };
      }

      // Create reset token
      const resetToken = await passwordResetService.createResetToken(
        data.email,
      );

      // Send reset email
      await emailService.sendPasswordResetLink(data.email, resetToken);

      logger.info(`Password reset requested for: ${data.email}`);
      return { message: "If the email exists, a reset link will be sent" };
    } catch (error: any) {
      logger.error("Error in forgot password:", error.message);
      throw error;
    }
  }

  // Reset password
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

  // Generate JWT token
  private generateToken(userId: string, email: string, role: string): string {
    return jwt.sign({ id: userId, email, role }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  }
}

export default new DoctorAuthService();
