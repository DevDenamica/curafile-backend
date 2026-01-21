import { z } from "zod";

export const addFamilyMemberSchema = z.object({
  familyMemberPatientId: z.string().min(1, "Family member patient ID is required"),
  relationship: z.string().min(2, "Relationship is required"),
  canViewMedicalRecords: z.boolean().default(false),
  canBookAppointments: z.boolean().default(false),
});

export type AddFamilyMemberDto = z.infer<typeof addFamilyMemberSchema>;

export const updateFamilyMemberPermissionsSchema = z.object({
  canViewMedicalRecords: z.boolean().optional(),
  canBookAppointments: z.boolean().optional(),
});

export type UpdateFamilyMemberPermissionsDto = z.infer<
  typeof updateFamilyMemberPermissionsSchema
>;

export interface FamilyMemberResponse {
  id: string;
  familyMemberPatientId: string;
  relationship: string | null;
  canViewMedicalRecords: boolean;
  canBookAppointments: boolean;
  createdAt: Date;
  familyMemberDetails?: {
    patientId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
  };
}
