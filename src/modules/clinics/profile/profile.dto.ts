import { z } from "zod";

// Update clinic profile schema
export const updateClinicProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  specializations: z.array(z.string()).optional(),
  insuranceCompaniesAccepted: z.array(z.string()).optional(),
  openingTime: z.string().optional(), // HH:MM format
  closingTime: z.string().optional(), // HH:MM format
  workingDays: z.array(z.string()).optional(), // ["MONDAY", "TUESDAY", ...]
  description: z.string().max(1000).optional(),
  logoUrl: z.string().url().optional(),
});

// Clinic profile response interface
export interface ClinicProfileResponse {
  id: string;
  ownerId: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  latitude: string | null;
  longitude: string | null;
  specializations: string[];
  insuranceCompaniesAccepted: string[];
  openingTime: string | null;
  closingTime: string | null;
  workingDays: string[];
  licenseNumber: string | null;
  licenseDocument: string | null;
  logoUrl: string | null;
  description: string | null;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  subscription?: {
    doctorSlots: number;
    usedSlots: number;
    status: string;
    endDate: Date;
  } | null;
}

export type UpdateClinicProfileDto = z.infer<typeof updateClinicProfileSchema>;
