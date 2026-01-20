import prisma from "@config/database";

import {
  CreateVaccinationRecordDto,
  UpdateVaccinationRecordDto,
  UploadMedicalDocumentDto,
  AddFamilyMemberDto,
  CreateSharingPermissionDto,
} from "./medical-records.dto";

export class MedicalRecordsRepository {
  // PATIENT LOOKUP

  async findPatientProfileByPatientId(patientId: string) {
    return prisma.patientProfile.findFirst({
      where: { qrCode: patientId },
      include: {
        user: {
          select: {
            email: true,
            phoneNumber: true,
          },
        },
      },
    });
  }

  // VACCINATION RECORDS

  async createVaccinationRecord(
    patientId: string,
    data: CreateVaccinationRecordDto,
    administeredBy?: string,
  ) {
    return prisma.vaccinationRecord.create({
      data: {
        patientId,
        ...data,
        administeredBy,
      },
    });
  }

  async getVaccinationRecords(patientId: string) {
    return prisma.vaccinationRecord.findMany({
      where: {
        patientId,
      },
      orderBy: {
        administeredDate: "desc",
      },
    });
  }

  async getVaccinationRecordById(patientId: string, recordId: string) {
    return prisma.vaccinationRecord.findFirst({
      where: {
        id: recordId,
        patientId,
      },
    });
  }

  async updateVaccinationRecord(
    patientId: string,
    recordId: string,
    data: UpdateVaccinationRecordDto,
  ) {
    return prisma.vaccinationRecord.updateMany({
      where: {
        id: recordId,
        patientId,
      },
      data,
    });
  }

  async deleteVaccinationRecord(patientId: string, recordId: string) {
    return prisma.vaccinationRecord.deleteMany({
      where: {
        id: recordId,
        patientId,
      },
    });
  }

  // MEDICAL DOCUMENTS

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
  async deleteMedicalDocument(patientId: string, documentId: string) {
    return prisma.medicalDocument.update({
      where: {
        id: documentId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  // FAMILY MEMBERS

  async addFamilyMember(
    primaryPatientId: string,
    familyMemberId: string,
    data: Omit<AddFamilyMemberDto, "familyMemberPatientId">,
  ) {
    return prisma.patientFamily.create({
      data: {
        primaryPatientId,
        familyMemberId,
        relationship: data.relationship,
        canViewMedicalRecords: data.canViewMedicalRecords,
        canBookAppointments: data.canBookAppointments,
      },
      include: {
        familyMember: {
          select: {
            id: true,
            qrCode: true,
            firstName: true,
            lastName: true,
            user: {
              select: {
                email: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
    });
  }

  getFamilyMembers(primaryPatientId: string) {
    return prisma.patientFamily.findMany({
      where: {
        primaryPatientId,
      },
      include: {
        familyMember: {
          select: {
            id: true,
            qrCode: true,
            firstName: true,
            lastName: true,
            user: {
              select: {
                email: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
    });
  }

  async getFamilyMemberById(
    primaryPatientId: string,
    familyRelationId: string,
  ) {
    return prisma.patientFamily.findFirst({
      where: {
        id: familyRelationId,
        primaryPatientId,
      },
      include: {
        familyMember: {
          select: {
            id: true,
            qrCode: true,
            firstName: true,
            lastName: true,
            user: {
              select: {
                email: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
    });
  }

  async updateFamilyMemberPermissions(
    primaryPatientId: string,
    familyRelationId: string,
    permissions: {
      canViewMedicalRecords?: boolean;
      canBookAppointments?: boolean;
    },
  ) {
    return prisma.patientFamily.update({
      where: {
        id: familyRelationId,
      },
      data: permissions,
    });
  }

  async removeFamilyMember(primaryPatientId: string, familyRelationId: string) {
    return prisma.patientFamily.delete({
      where: {
        id: familyRelationId,
      },
    });
  }

  // SHARING PERMISSIONS

  async createSharingPermission(
    patientId: string,
    data: CreateSharingPermissionDto,
  ) {
    return prisma.medicalRecordSharingPermission.create({
      data: {
        patientId,
        sharedWithType: data.sharedWithType,
        sharedWithId: data.sharedWithId,
        recordType: data.recordType,
        canView: data.canView ?? true,
        canDownload: data.canDownload ?? false,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
  }

  async getSharingPermissions(patientId: string) {
    return prisma.medicalRecordSharingPermission.findMany({
      where: {
        patientId,
        revokedAt: null,
      },
    });
  }

  async revokeSharingPermission(patientId: string, permissionId: string) {
    return prisma.medicalRecordSharingPermission.update({
      where: {
        id: permissionId,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}

export default new MedicalRecordsRepository();
