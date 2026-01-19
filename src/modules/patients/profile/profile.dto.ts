import { z } from "zod";

export const updatePatientProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  bloodType: z
    .enum([
      "A_POSITIVE",
      "A_NEGATIVE",
      "B_POSITIVE",
      "B_NEGATIVE",
      "AB_POSITIVE",
      "AB_NEGATIVE",
      "O_POSITIVE",
      "O_NEGATIVE",
    ])
    .optional(),
  nationalId: z.string().optional(),
  nationality: z.string().optional(),
  profilePicture: z.string().url().optional(),
  // Emergency Contact
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  // Insurance
  insuranceCompanyName: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
  insuranceMemberNumber: z.string().optional(),
  insuranceExpiryDate: z.string().datetime().optional(),
  insuranceCardFrontUrl: z.string().url().optional(),
  insuranceCardBackUrl: z.string().url().optional(),
  // Medical History
  allergies: z.array(z.string()).optional(),
  chronicConditions: z.array(z.string()).optional(),
  currentMedications: z.array(z.string()).optional(),
});

export type UpdatePatientProfileDto = z.infer<
  typeof updatePatientProfileSchema
>;

export interface PatientProfileResponse {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  bloodType: string | null;
  nationalId: string | null;
  nationality: string | null;
  profilePicture: string | null;
  // Emergency Contact
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelation: string | null;
  // Insurance
  insuranceCompanyName: string | null;
  insurancePolicyNumber: string | null;
  insuranceMemberNumber: string | null;
  insuranceExpiryDate: Date | null;
  insuranceCardFrontUrl: string | null;
  insuranceCardBackUrl: string | null;
  // Medical History
  allergies: string[] | null;
  chronicConditions: string[] | null;
  currentMedications: string[] | null;
  // QR Code
  qrCode: string;
  // User fields
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
}
