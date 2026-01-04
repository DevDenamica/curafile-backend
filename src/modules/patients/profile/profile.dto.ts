import { z } from "zod";

// Update Patient Profile
export const updatePatientProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phoneNumber: z.string().min(10).optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  countryResidence: z.string().optional(),
  nationality: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
});

export type UpdatePatientProfileDto = z.infer<
  typeof updatePatientProfileSchema
>;

// Patient Profile Response (extended version with all fields)
export interface PatientProfileResponse {
  id: string;
  patientId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  countryResidence: string | null;
  nationality: string;
  dateOfBirth: Date | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  zipCode: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  bloodType: string | null;
  allergies: string | null;
  chronicConditions: string | null;
  profilePhoto: string | null;
  emailVerified: boolean;
  termsAccepted: boolean;
  isActive: boolean;
  createdAt: Date;
}
