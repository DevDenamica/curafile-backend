import { z } from "zod";

// Register schema - what data is needed to create a doctor
export const registerDoctorSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phoneNumber: z.string().optional(),
  specialization: z.string().optional(),
  medicalLicenseNumber: z.string().min(5, "Medical license number is required"),
});

// Login schema - what data is needed to login
export const loginDoctorSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Verify email schema
export const verifyEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().length(6, "Verification code must be 6 digits"),
});

// Resend verification schema
export const resendVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Forget password schema
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Reset Password schema
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// Refresh token schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

// Typescript types inferred from schemas
export type RegisterDoctorDto = z.infer<typeof registerDoctorSchema>;
export type LoginDoctorDto = z.infer<typeof loginDoctorSchema>;
export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationDto = z.infer<typeof resendVerificationSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;

// Response interfaces (what we return to the client)
export interface DoctorAuthResponse {
  user: {
    id: string;
    email: string;
    phoneNumber: string | null;
  };
  doctor: {
    id: string;
    doctorId: string;
    firstName: string;
    lastName: string;
    specialization: string | null;
    isVerified: boolean;
  };
  token: string;
  refreshToken?: string;
}

export interface DoctorProfileResponse {
  id: string;
  doctorId: string;
  firstName: string;
  lastName: string;
  specialization: string | null;
  isVerified: boolean;
  email: string;
  phoneNumber: string | null;
}
