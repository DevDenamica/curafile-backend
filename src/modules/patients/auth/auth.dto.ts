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
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters"),
  nationality: z.string().min(2, "Nationality is required"),
});

export type CompleteRegistrationDto = z.infer<
  typeof completeRegistrationSchema
>;

// Step 4: Accept terms
export const acceptTermsSchema = z.object({
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

// User response (for auth)
export interface UserResponse {
  id: string;
  email: string;
  phoneNumber: string | null;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    nationality: string | null;
    qrCode: string;
  } | null;
}

// Auth response
export interface AuthResponse {
  user: UserResponse;
  token: string;
}
