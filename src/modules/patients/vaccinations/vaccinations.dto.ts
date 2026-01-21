import { z } from "zod";

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
