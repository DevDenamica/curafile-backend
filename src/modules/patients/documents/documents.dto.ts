import { z } from "zod";

export const uploadMedicalDocumentSchema = z.object({
  title: z.string().min(2, "Title is required"),
  documentType: z.string().min(2, "Document type is required"),
  fileUrl: z.string().url("Invalid file URL"),
  fileType: z.string().optional(),
});

export type UploadMedicalDocumentDto = z.infer<
  typeof uploadMedicalDocumentSchema
>;

export const updateMedicalDocumentSchema = uploadMedicalDocumentSchema.partial();

export type UpdateMedicalDocumentDto = z.infer<
  typeof updateMedicalDocumentSchema
>;

export interface MedicalDocumentResponse {
  id: string;
  title: string | null;
  documentType: string | null;
  fileUrl: string;
  fileType: string | null;
  uploadedAt: Date;
}
