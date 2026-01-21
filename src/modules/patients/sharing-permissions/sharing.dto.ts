import { z } from "zod";

export const createSharingPermissionSchema = z.object({
  sharedWithType: z.enum(["DOCTOR", "CLINIC", "FAMILY_MEMBER"]),
  sharedWithId: z.string().min(1, "Shared with ID is required"),
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

export const updateSharingPermissionSchema = z.object({
  recordType: z
    .enum([
      "ALL",
      "CONSULTATIONS",
      "PRESCRIPTIONS",
      "LAB_RESULTS",
      "MEDICAL_DOCUMENTS",
    ])
    .optional(),
  canView: z.boolean().optional(),
  canDownload: z.boolean().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
});

export type UpdateSharingPermissionDto = z.infer<
  typeof updateSharingPermissionSchema
>;

export interface SharedWithDetails {
  id: string;
  name: string;
  email?: string | null;
  phoneNumber?: string | null;
  type: "DOCTOR" | "CLINIC" | "FAMILY_MEMBER";
}

export interface SharingPermissionResponse {
  id: string;
  sharedWithType: string;
  sharedWithId: string | null;
  sharedWith: SharedWithDetails | null;
  recordType: string;
  canView: boolean;
  canDownload: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  revokedAt: Date | null;
}

export interface SharedByDetails {
  id: string;
  patientId: string;
  name: string;
  email?: string | null;
  phoneNumber?: string | null;
}

export interface ReceivedPermissionResponse {
  id: string;
  sharedBy: SharedByDetails;
  recordType: string;
  canView: boolean;
  canDownload: boolean;
  expiresAt: Date | null;
  createdAt: Date;
}