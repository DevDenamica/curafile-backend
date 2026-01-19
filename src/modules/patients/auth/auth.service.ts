import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "@config/env";
import patientRepository, {
  UserWithProfile,
} from "../shared/patient.repository";
import otpService from "@shared/services/otp.service";
import emailService from "@shared/services/email.service";
import logger from "@shared/utils/logger";
import { PasswordValidator } from "@shared/utils/passwordValidator";
import {
  SendOtpDto,
  VerifyOtpDto,
  CompleteRegistrationDto,
  AcceptTermsDto,
  LoginDto,
  UserResponse,
  AuthResponse,
} from "./auth.dto";
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from "@shared/exceptions/AppError";
import prisma from "@config/database";

export class AuthService {
  async sendOtp(data: SendOtpDto): Promise<{ message: string }> {
    const { email } = data;

    const existingUser = await patientRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError("Email already registered");
    }

    await otpService.sendEmailVerificationOTP(email);

    return {
      message: `OTP sent successfully to ${email}. Please check your email.`,
    };
  }

  async verifyOtp(
    data: VerifyOtpDto,
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

  async completeRegistration(
    data: CompleteRegistrationDto,
  ): Promise<{ message: string; user: UserResponse }> {
    const { email, password } = data;

    const hasVerifiedEmail = await otpService.hasVerifiedEmail(email);
    if (!hasVerifiedEmail) {
      throw new BadRequestError(
        "Email not verified. Please verify your email first.",
      );
    }

    const existingUser = await patientRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError("Email already registered");
    }

    const passwordValidation = PasswordValidator.validate(password);
    if (!passwordValidation.isValid) {
      throw new BadRequestError(passwordValidation.errors.join(", "));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await patientRepository.create({
      ...data,
      hashedPassword,
    });

    return {
      message:
        "Registration completed successfully. Please accept the terms and conditions to activate your account.",
      user: this.toUserResponse(user),
    };
  }

  async acceptTerms(
    userId: string,
    _data: AcceptTermsDto,
  ): Promise<{ message: string }> {
    const user = await patientRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const hasAccepted = await patientRepository.hasAcceptedTerms(userId);
    if (hasAccepted) {
      throw new BadRequestError("Terms already accepted");
    }

    // Get the latest terms version
    const latestTerms = await prisma.termsVersion.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!latestTerms) {
      throw new NotFoundError("Terms version not found");
    }

    await patientRepository.acceptTerms(userId, latestTerms.id);

    // Send welcome email
    if (user.patientProfile) {
      const fullName = `${user.patientProfile.firstName} ${user.patientProfile.lastName}`;
      await emailService.sendWelcomeEmail(
        user.email,
        fullName,
        user.patientProfile.qrCode,
      );
    }

    return {
      message: "Terms accepted successfully. Welcome to Curafile!",
    };
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    const { email, password } = data;

    const user = await patientRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isActive || user.isDeleted) {
      await patientRepository.reactivate(user.id);
      logger.info(`User ${user.email} reactivated account via login`);
    }

    const hasAcceptedTerms = await patientRepository.hasAcceptedTerms(user.id);
    if (!hasAcceptedTerms) {
      throw new UnauthorizedError(
        "Please accept the terms and conditions to complete registration",
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    await patientRepository.updateLastLogin(user.id);

    const token = this.generateToken(user);

    return {
      user: this.toUserResponse(user),
      token,
    };
  }

  private generateToken(user: UserWithProfile): string {
    const payload = {
      id: user.id,
      email: user.email,
      role: "PATIENT",
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  private toUserResponse(user: UserWithProfile): UserResponse {
    return {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      profile: user.patientProfile
        ? {
            id: user.patientProfile.id,
            firstName: user.patientProfile.firstName,
            lastName: user.patientProfile.lastName,
            nationality: user.patientProfile.nationality,
            qrCode: user.patientProfile.qrCode,
          }
        : null,
    };
  }
}

export default new AuthService();
