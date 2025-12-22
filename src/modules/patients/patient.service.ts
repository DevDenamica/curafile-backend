import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "@config/env";
import patientRepository from "./patient.repository";
import otpService from "@shared/services/otp.service";
import emailService from "@shared/services/email.service";
import passwordResetService from "@shared/services/passwordReset.service";
import { PasswordValidator } from "@shared/utils/passwordValidator";
import {
  SendOtpDto,
  VerifyOtpDto,
  CompleteRegistrationDto,
  AcceptTermsDto,
  LoginDto,
  PatientResponse,
  AuthResponse,
  ForgotPasswordDto,
  ResetPasswordDto,
} from "./patient.dto";
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from "@shared/exceptions/AppError";
import type { Patient } from "@prisma/client";

export class PatientService {
  // Step 1: Send OTP to email
  async sendOtp(data: SendOtpDto): Promise<{ message: string }> {
    const { email } = data;

    // Check if patient already exists
    const existingPatient = await patientRepository.findByEmail(email);
    if (existingPatient) {
      throw new ConflictError("Email already registered");
    }

    // Send OTP
    await otpService.sendEmailVerificationOTP(email);

    return {
      message: `OTP sent successfully to ${email}. Please check your email.`,
    };
  }

  // Step 2: Verify OTP
  async verifyOtp(
    data: VerifyOtpDto
  ): Promise<{ message: string; verified: boolean }> {
    const { email, code } = data;

    const isValid = await otpService.verifyEmailOTP(email, code);

    if (!isValid) {
      throw new BadRequestError("Invalid or expired OTP");
    }

    return {
      message:
        "Email verified successfully. You can now complete your registration.",
      verified: true,
    };
  }

  // Step 3: Complete registration with details
  async completeRegistration(
    data: CompleteRegistrationDto
  ): Promise<{ message: string; patient: PatientResponse }> {
    const { email, password } = data;

    // Check if email was verified
    const hasVerifiedEmail = await otpService.hasVerifiedEmail(email);
    if (!hasVerifiedEmail) {
      throw new BadRequestError(
        "Email not verified. Please verify your email first."
      );
    }

    // Check if patient already exists
    const existingPatient = await patientRepository.findByEmail(email);
    if (existingPatient) {
      throw new ConflictError("Email already registered");
    }

    // Validate password
    const passwordValidation = PasswordValidator.validate(password);
    if (!passwordValidation.isValid) {
      throw new BadRequestError(passwordValidation.errors.join(", "));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create patient
    const patient = await patientRepository.create({
      ...data,
      hashedPassword,
    });

    return {
      message:
        "Registration completed successfully. Please accept the terms and conditions to activate your account.",
      patient: this.toPatientResponse(patient),
    };
  }

  // Step 4: Accept terms and activate account
  async acceptTerms(
    data: AcceptTermsDto
  ): Promise<{ message: string; patient: PatientResponse }> {
    const { email } = data;

    // Find patient
    const patient = await patientRepository.findByEmail(email);
    if (!patient) {
      throw new NotFoundError("Patient not found");
    }

    if (patient.termsAccepted) {
      throw new BadRequestError("Terms already accepted");
    }

    // Accept terms
    const updatedPatient = await patientRepository.acceptTerms(email);

    // Send welcome email
    await emailService.sendWelcomeEmail(
      updatedPatient.email,
      updatedPatient.fullName,
      updatedPatient.patientId
    );

    return {
      message: "Terms accepted successfully. Welcome to Curafile!",
      patient: this.toPatientResponse(updatedPatient),
    };
  }

  // Login
  async login(data: LoginDto): Promise<AuthResponse> {
    const { email, password } = data;

    // Find patient
    const patient = await patientRepository.findByEmail(email);
    if (!patient) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Check if patient is active
    if (!patient.isActive) {
      throw new UnauthorizedError(
        "Account is inactive. Please contact support."
      );
    }

    // Check if terms were accepted
    if (!patient.termsAccepted) {
      throw new UnauthorizedError(
        "Please accept the terms and conditions to complete registration"
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, patient.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Generate JWT token
    const token = this.generateToken(patient);

    return {
      patient: this.toPatientResponse(patient),
      token,
    };
  }

  // Get patient profile
  async getProfile(patientId: string): Promise<PatientResponse> {
    const patient = await patientRepository.findById(patientId);
    if (!patient) {
      throw new NotFoundError("Patient not found");
    }

    return this.toPatientResponse(patient);
  }

  // Helper: Generate JWT token
  private generateToken(patient: Patient): string {
    const payload = {
      id: patient.id,
      patientId: patient.patientId,
      email: patient.email,
      role: "PATIENT",
    };

    // @ts-ignore - JWT expiresIn accepts string from env
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });
  }

  // Helper: Convert Patient to PatientResponse
  private toPatientResponse(patient: Patient): PatientResponse {
    return {
      id: patient.id,
      patientId: patient.patientId,
      fullName: patient.fullName,
      email: patient.email,
      phoneNumber: patient.phoneNumber,
      countyResidence: patient.countyResidence,
      nationality: patient.nationality,
      emailVerified: patient.emailVerified,
      termsAccepted: patient.termsAccepted,
      isActive: patient.isActive,
      createdAt: patient.createdAt,
    };
  }

  // Forgot Password - Request password reset via link
  async forgotPassword(data: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = data;

    // Check if patient exists
    const patient = await patientRepository.findByEmail(email);
    if (!patient) {
      // Don't reveal if email exists or not (security)
      return {
        message: `If an account exists with ${email}, you will receive a password reset link shortly`,
      };
    }

    // Check if account is active
    if (!patient.isActive) {
      throw new BadRequestError("Account is inactive, please contact support");
    }

    // Generate reset token and send email with link
    const resetToken = await passwordResetService.createResetToken(email);
    await emailService.sendPasswordResetLink(email, resetToken);

    return {
      message: `If an account exists with ${email}, you will receive a password reset link shortly`,
    };
  }

  // Verify reset token (optional - for frontend to check if token is valid)
  async verifyResetToken(token: string): Promise<{ valid: boolean; email?: string }> {
    return await passwordResetService.verifyResetToken(token);
  }

  // Reset Password with token
  async resetPassword(data: ResetPasswordDto): Promise<{ message: string }> {
    const { token, newPassword } = data;

    // Verify reset token
    const tokenVerification = await passwordResetService.verifyResetToken(token);
    if (!tokenVerification.valid || !tokenVerification.email) {
      throw new BadRequestError(
        "Invalid or expired reset link. Please request a new password reset"
      );
    }

    const email = tokenVerification.email;

    // Find patient
    const patient = await patientRepository.findByEmail(email);
    if (!patient) {
      throw new NotFoundError("Patient not found");
    }

    // Validate new password
    const passwordValidation = PasswordValidator.validate(newPassword);
    if (!passwordValidation.isValid) {
      throw new BadRequestError(passwordValidation.errors.join(", "));
    }

    // Check if new password is same as old password
    const isSamePassword = await bcrypt.compare(newPassword, patient.password);
    if (isSamePassword) {
      throw new BadRequestError(
        "New password cannot be the same as your current password"
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await patientRepository.updatePassword(patient.id, hashedPassword);

    // Mark token as used
    await passwordResetService.markTokenAsUsed(token);

    return {
      message:
        "Password reset successfully. You can now login with your new password",
    };
  }
}

export default new PatientService();
