import documentsRepository from "./documents.repository";
import patientRepository from "../shared/patient.repository";
import {
  UploadMedicalDocumentDto,
  UpdateMedicalDocumentDto,
  MedicalDocumentResponse,
} from "./documents.dto";
import { NotFoundError } from "@/shared/exceptions/AppError";
import logger from "@shared/utils/logger";

export class DocumentsService {
  async uploadMedicalDocument(
    userId: string,
    data: UploadMedicalDocumentDto,
  ): Promise<MedicalDocumentResponse> {
    try {
      const user = await patientRepository.findById(userId);
      if (!user || !user.patientProfile) {
        throw new NotFoundError("Patient profile not found");
      }

      const document = await documentsRepository.uploadMedicalDocument(
        user.patientProfile.id,
        data,
        userId,
      );

      logger.info(
        `Medical document uploaded for patient ${user.patientProfile.qrCode}`,
      );
      return {
        id: document.id,
        title: document.title,
        documentType: document.documentType,
        fileUrl: document.fileUrl,
        fileType: document.fileType,
        uploadedAt: document.uploadedAt,
      };
    } catch (error: any) {
      logger.error("Error uploading medical document:", error.message);
      throw error;
    }
  }

  async getMedicalDocuments(
    userId: string,
  ): Promise<MedicalDocumentResponse[]> {
    try {
      const user = await patientRepository.findById(userId);
      if (!user || !user.patientProfile) {
        throw new NotFoundError("Patient profile not found");
      }

      const documents = await documentsRepository.getMedicalDocuments(
        user.patientProfile.id,
      );
      return documents.map((doc) => ({
        id: doc.id,
        title: doc.title,
        documentType: doc.documentType,
        fileUrl: doc.fileUrl,
        fileType: doc.fileType,
        uploadedAt: doc.uploadedAt,
      }));
    } catch (error: any) {
      logger.error("Error fetching medical documents:", error.message);
      throw error;
    }
  }

  async updateMedicalDocument(
    userId: string,
    documentId: string,
    data: UpdateMedicalDocumentDto,
  ): Promise<MedicalDocumentResponse> {
    try {
      const user = await patientRepository.findById(userId);
      if (!user || !user.patientProfile) {
        throw new NotFoundError("Patient profile not found");
      }

      // Verify the document belongs to this patient
      const existingDocument = await documentsRepository.getMedicalDocumentById(
        user.patientProfile.id,
        documentId,
      );
      if (!existingDocument) {
        throw new NotFoundError("Medical document not found");
      }

      const updatedDocument = await documentsRepository.updateMedicalDocument(
        user.patientProfile.id,
        documentId,
        data,
      );

      logger.info(
        `Medical document ${documentId} updated for patient ${user.patientProfile.id}`,
      );

      return {
        id: updatedDocument.id,
        title: updatedDocument.title,
        documentType: updatedDocument.documentType,
        fileUrl: updatedDocument.fileUrl,
        fileType: updatedDocument.fileType,
        uploadedAt: updatedDocument.uploadedAt,
      };
    } catch (error: any) {
      logger.error("Error updating medical document:", error.message);
      throw error;
    }
  }

  async deleteMedicalDocument(
    userId: string,
    documentId: string,
  ): Promise<void> {
    try {
      const user = await patientRepository.findById(userId);
      if (!user || !user.patientProfile) {
        throw new NotFoundError("Patient profile not found");
      }

      // Verify the document belongs to this patient
      const existingDocument = await documentsRepository.getMedicalDocumentById(
        user.patientProfile.id,
        documentId,
      );
      if (!existingDocument) {
        throw new NotFoundError("Medical document not found");
      }

      await documentsRepository.deleteMedicalDocument(
        user.patientProfile.id,
        documentId,
      );

      logger.info(
        `Medical document ${documentId} deleted for patient ${user.patientProfile.id}`,
      );
    } catch (error: any) {
      logger.error("Error deleting medical document:", error.message);
      throw error;
    }
  }
}

export default new DocumentsService();
