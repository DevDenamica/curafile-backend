import { z } from "zod";

// Update profile schema - all fields optional since it's a partial update
export const updateDoctorProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .optional(),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .optional(),
  phoneNumber: z.string().optional(),
  specialization: z.string().optional(),
  subSpecialization: z.string().optional(),
  yearsOfExperience: z.number().int().min(0).optional(),
  medicalLicenseNumber: z.string().optional(),
  licenseExpiryDate: z.string().optional(), // ISO date string
  biography: z
    .string()
    .max(1000, "Biography cannot exceed 1000 characters")
    .optional(),
  languages: z.array(z.string()).optional(),
});

// TypeScript type inferred from schema
export type UpdateDoctorProfileDto = z.infer<typeof updateDoctorProfileSchema>;

// Response interface = what we return to the client
export interface DoctorProfileResponse {
  id: string;
  doctorId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  specialization: string | null;
  subSpecialization: string | null;
  yearsOfExperience: number | null;
  medicalLicenseNumber: string | null;
  licenseExpiryDate: Date | null;
  biography: string | null;
  languages: string[] | null;
  profilePicture: string | null;
  isVerified: boolean;
  rating: number | null;
  totalConsultations: number;
  createdAt: Date;
}
