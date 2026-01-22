import { Request, Response } from "express";
import documentsService from "./documents.service";
import {
  uploadMedicalDocumentSchema,
  updateMedicalDocumentSchema,
} from "./documents.dto";

export class DocumentsController {
  async uploadMedicalDocument(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const data = uploadMedicalDocumentSchema.parse(req.body);
    const result = await documentsService.uploadMedicalDocument(userId, data);
    res.status(201).json(result);
  }

  async getMedicalDocuments(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const result = await documentsService.getMedicalDocuments(userId);
    res.status(200).json(result);
  }

  async updateMedicalDocument(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const documentId = req.params.documentId as string;
    const data = updateMedicalDocumentSchema.parse(req.body);
    const result = await documentsService.updateMedicalDocument(
      userId,
      documentId,
      data,
    );
    res.status(200).json(result);
  }

  async deleteMedicalDocument(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const documentId = req.params.documentId as string;
    await documentsService.deleteMedicalDocument(userId, documentId);
    res.status(200).json({
      success: true,
      message: "Medical document deleted successfully",
    });
  }

  // Get shared patient's documents
  async getSharedPatientDocuments(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const patientId = req.params.patientId as string;
    const result = await documentsService.getSharedPatientDocuments(
      userId,
      patientId,
    );
    res.status(200).json(result);
  }
}

export default new DocumentsController();
