import { z } from "zod";

// Invite doctor schema
export const inviteDoctorSchema = z
  .object({
    doctorEmail: z.string().email("Invalid email address").optional(),
    doctorId: z.string().uuid("Invalid doctor ID").optional(),
    consultationFee: z.number().positive().optional(),
    slotDuration: z.number().int().positive().optional(),
    schedule: z.record(z.any()).optional(), // JSON object for schedule
  })
  .refine((data) => data.doctorEmail || data.doctorId, {
    message: "Either doctorEmail or doctorId must be provided",
  });

// Update doctor affiliation schema
export const updateDoctorAffiliationSchema = z.object({
  consultationFee: z.number().positive().optional(),
  slotDuration: z.number().int().positive().optional(),
  schedule: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
});

// Response interfaces
export interface DoctorInvitationResponse {
  id: string;
  clinicId: string;
  clinicName: string;
  doctorId: string;
  doctorName: string;
  doctorEmail: string;
  status: string;
  invitedAt: Date;
  respondedAt: Date | null;
  expiresAt: Date | null;
  consultationFee: string | null;
  slotDuration: number | null;
  isActive: boolean;
}

export interface AffiliatedDoctorResponse {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorEmail: string;
  specialization: string | null;
  status: string;
  consultationFee: string | null;
  slotDuration: number | null;
  schedule: any;
  isActive: boolean;
  addedAt: Date | null;
}

export type InviteDoctorDto = z.infer<typeof inviteDoctorSchema>;
export type UpdateDoctorAffiliationDto = z.infer<
  typeof updateDoctorAffiliationSchema
>;
