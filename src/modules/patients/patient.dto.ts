import { z } from "zod";

// Step 1: Send OTP to email
export const sendOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type SendOtpDto = z.infer<typeof sendOtpSchema>;

// Step 2: Verify OTP
export const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().length(6, "OTP must be 6 digits"),
});

export type VerifyOtpDto = z.infer<typeof verifyOtpSchema>;

// Step 3: Complete registration with details
export const completeRegistrationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters"),
  countyResidence: z.string().min(2, "County residence is required"),
  nationality: z.string().min(2, "Nationality is required"),
});

export type CompleteRegistrationDto = z.infer<
  typeof completeRegistrationSchema
>;

// Step 4: Accept terms
export const acceptTermsSchema = z.object({
  email: z.string().email("Invalid email address"),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export type AcceptTermsDto = z.infer<typeof acceptTermsSchema>;

// Login
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginDto = z.infer<typeof loginSchema>;

// Patient response
export interface PatientResponse {
  id: string;
  patientId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  countyResidence: string;
  nationality: string;
  emailVerified: boolean;
  termsAccepted: boolean;
  isActive: boolean;
  createdAt: Date;
}

// Auth response
export interface AuthResponse {
  patient: PatientResponse;
  token: string;
}

// Forgot Password
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;

// Verify Reset Token (optional - for frontend to check if token is valid)
export const verifyResetTokenSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
});

export type VerifyResetTokenDto = z.infer<typeof verifyResetTokenSchema>;

// Reset Password with Token
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
