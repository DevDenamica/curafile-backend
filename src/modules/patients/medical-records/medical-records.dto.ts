import { z } from "zod";

// VACCINATION RECORDS DTOs

export const createVaccinationRecordSchema = z.object({
  vaccineName: z.string().min(2, "Vaccine name is required"),
  vaccineCode: z.string().optional(),
  dosageNumber: z
    .number()
    .int()
    .positive("Dosage number must be positive")
    .optional(),
  administeredBy: z.string().optional(),
  administeredDate: z.string().datetime().optional(),
  nextDoseDate: z.string().datetime().optional(),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  certificateUrl: z.string().url().optional(),
});

export type CreateVaccinationRecordDto = z.infer<
  typeof createVaccinationRecordSchema
>;

export const updateVaccinationRecordSchema =
  createVaccinationRecordSchema.partial();

export type UpdateVaccinationRecordDto = z.infer<
  typeof updateVaccinationRecordSchema
>;

export interface VaccinationRecordResponse {
  id: string;
  vaccineName: string | null;
  vaccineCode: string | null;
  dosageNumber: number | null;
  administeredBy: string | null;
  administeredDate: string | null;
  nextDoseDate: string | null;
  batchNumber: string | null;
  expiryDate: string | null;
  sideEffects: string | null;
  certificateUrl: string | null;
  createdAt: Date;
}

// MEDICAL DOCUMENTS DTOs

export const uploadMedicalDocumentSchema = z.object({
  title: z.string().min(2, "Title is required"),
  documentType: z.string().min(2, "Document type is required"),
  fileUrl: z.string().url("Invalid file URL"),
  fileType: z.string().optional(),
});

export type UploadMedicalDocumentDto = z.infer<
  typeof uploadMedicalDocumentSchema
>;

export interface MedicalDocumentResponse {
  id: string;
  title: string | null;
  documentType: string | null;
  fileUrl: string;
  fileType: string | null;
  uploadedAt: Date;
}

// FAMILY MEMBERS DTOs

export const addFamilyMemberSchema = z.object({
  familyMemberPatientId: z.string().min(1, "Family member patient ID is required"),
  relationship: z.string().min(2, "Relationship is required"),
  canViewMedicalRecords: z.boolean().default(false),
  canBookAppointments: z.boolean().default(false),
});

export type AddFamilyMemberDto = z.infer<typeof addFamilyMemberSchema>;

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

// SHARING PERMISSIONS DTOs

export const createSharingPermissionSchema = z.object({
  sharedWithType: z.enum(["DOCTOR", "CLINIC", "FAMILY_MEMBER"]),
  sharedWithId: z.string().optional(),
  recordType: z.enum([
    "ALL",
    "CONSULTATIONS",
    "PRESCRIPTIONS",
    "LAB_RESULTS",
    "MEDICAL_DOCUMENTS",
  ]),
  canView: z.boolean().default(true),
  canDownload: z.boolean().default(false),
  expiresAt: z.string().datetime().optional(),
});

export type CreateSharingPermissionDto = z.infer<
  typeof createSharingPermissionSchema
>;

export interface SharingPermissionResponse {
  id: string;
  recordType: string;
  canView: boolean;
  canDownload: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  revokedAt: Date | null;
}
