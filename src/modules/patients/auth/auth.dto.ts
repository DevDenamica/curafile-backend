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

// Helper function to calculate age
const calculateAge = (dateOfBirth: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
};

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
  dateOfBirth: z
    .string()
    .datetime("Invalid date format")
    .refine(
      (date) => {
        const age = calculateAge(new Date(date));
        return age >= 18;
      },
      { message: "You must be at least 18 years old to register" }
    ),
  covidVaccinated: z.boolean(),
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
  patientId: string;
  email: string;
  phoneNumber: string | null;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  profile: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date | null;
    age: number | null;
    nationality: string | null;
    covidVaccinated: boolean;
    qrCodeUrl: string | null;
  } | null;
}

// Auth response
export interface AuthResponse {
  user: UserResponse;
  token: string;
  termsAccepted: boolean;
}
