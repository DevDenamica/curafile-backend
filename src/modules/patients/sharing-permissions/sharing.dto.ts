import { z } from "zod";

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
