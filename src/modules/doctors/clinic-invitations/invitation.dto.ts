import { z } from "zod";

// Accept invitation schema
export const acceptInvitationSchema = z.object({
  clinicDoctorId: z.string().uuid("Invalid invitation ID"),
});

// Reject invitation schema
export const rejectInvitationSchema = z.object({
  clinicDoctorId: z.string().uuid("Invalid invitation ID"),
});

// Response interface
export interface ClinicInvitationResponse {
  id: string;
  clinicId: string;
  clinicName: string;
  clinicEmail: string | null;
  clinicAddress: string | null;
  clinicCity: string | null;
  clinicCountry: string | null;
  status: string;
  invitedAt: Date;
  expiresAt: Date | null;
  consultationFee: string | null;
  slotDuration: number | null;
}

export interface MyClinicResponse {
  id: string;
  clinicId: string;
  clinicName: string;
  clinicEmail: string | null;
  clinicAddress: string | null;
  clinicCity: string | null;
  clinicCountry: string | null;
  consultationFee: string | null;
  slotDuration: number | null;
  schedule: any;
  isActive: boolean;
  addedAt: Date | null;
}

export type AcceptInvitationDto = z.infer<typeof acceptInvitationSchema>;
export type RejectInvitationDto = z.infer<typeof rejectInvitationSchema>;
