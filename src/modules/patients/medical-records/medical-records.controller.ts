import { Request, Response } from "express";
import medicalRecordsService from "./medical-record.service";
import {
  createVaccinationRecordSchema,
  updateVaccinationRecordSchema,
  uploadMedicalDocumentSchema,
  addFamilyMemberSchema,
  createSharingPermissionSchema,
} from "./medical-records.dto";

export class MedicalRecordsController {
  // VACCINATION RECORDS

  async createVaccinationRecord(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const data = createVaccinationRecordSchema.parse(req.body);
    const result = await medicalRecordsService.createVaccinationRecord(userId, data);
    res.status(201).json(result);
  }

  async getVaccinationRecords(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const result = await medicalRecordsService.getVaccinationRecords(userId);
    res.status(200).json(result);
  }

  async updateVaccinationRecord(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { recordId } = req.params;
    const data = updateVaccinationRecordSchema.parse(req.body);
    const result = await medicalRecordsService.updateVaccinationRecord(userId, recordId, data);
    res.status(200).json(result);
  }

  async deleteVaccinationRecord(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { recordId } = req.params;
    const result = await medicalRecordsService.deleteVaccinationRecord(userId, recordId);
    res.status(200).json(result);
  }

  // MEDICAL DOCUMENTS

  async uploadMedicalDocument(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const data = uploadMedicalDocumentSchema.parse(req.body);
    const result = await medicalRecordsService.uploadMedicalDocument(userId, data);
    res.status(201).json(result);
  }

  async getMedicalDocuments(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const result = await medicalRecordsService.getMedicalDocuments(userId);
    res.status(200).json(result);
  }

  // FAMILY MEMBERS

  async addFamilyMember(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const data = addFamilyMemberSchema.parse(req.body);
    const result = await medicalRecordsService.addFamilyMember(userId, data);
    res.status(201).json(result);
  }

  async getFamilyMembers(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const result = await medicalRecordsService.getFamilyMembers(userId);
    res.status(200).json(result);
  }

  async updateFamilyMemberPermissions(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { relationId } = req.params;
    const { canViewMedicalRecords, canBookAppointments } = req.body;
    const result = await medicalRecordsService.updateFamilyMemberPermissions(
      userId,
      relationId,
      { canViewMedicalRecords, canBookAppointments }
    );
    res.status(200).json(result);
  }

  async removeFamilyMember(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { relationId } = req.params;
    const result = await medicalRecordsService.removeFamilyMember(userId, relationId);
    res.status(200).json(result);
  }

  // SHARING PERMISSIONS

  async createSharingPermission(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const data = createSharingPermissionSchema.parse(req.body);
    const result = await medicalRecordsService.createSharingPermission(userId, data);
    res.status(201).json(result);
  }

  async getSharingPermissions(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const result = await medicalRecordsService.getSharingPermissions(userId);
    res.status(200).json(result);
  }

  async revokeSharingPermission(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { permissionId } = req.params;
    const result = await medicalRecordsService.revokeSharingPermission(userId, permissionId);
    res.status(200).json(result);
  }
}

export default new MedicalRecordsController();
