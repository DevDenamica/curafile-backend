import prisma from "@config/database";
import {
  UploadMedicalDocumentDto,
  UpdateMedicalDocumentDto,
} from "./documents.dto";

export class DocumentsRepository {
  async uploadMedicalDocument(
    patientId: string,
    data: UploadMedicalDocumentDto,
    uploadedBy: string,
  ) {
    return prisma.medicalDocument.create({
      data: {
        patientId,
        uploadedBy,
        ...data,
      },
    });
  }

  async getMedicalDocuments(patientId: string) {
    return prisma.medicalDocument.findMany({
      where: {
        patientId,
        isDeleted: false,
      },
      include: {
        uploader: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        uploadedAt: "desc",
      },
    });
  }

  async getMedicalDocumentById(patientId: string, documentId: string) {
    return prisma.medicalDocument.findFirst({
      where: {
        id: documentId,
        patientId,
        isDeleted: false,
      },
      include: {
        uploader: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  async updateMedicalDocument(
    patientId: string,
    documentId: string,
    data: UpdateMedicalDocumentDto,
  ) {
    return prisma.medicalDocument.update({
      where: {
        id: documentId,
        patientId,
        isDeleted: false,
      },
      data,
    });
  }

  async deleteMedicalDocument(patientId: string, documentId: string) {
    return prisma.medicalDocument.update({
      where: {
        id: documentId,
        patientId,
        isDeleted: false,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }
}

export default new DocumentsRepository();
