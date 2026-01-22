import prisma from "@config/database";
import { RecordType } from "@prisma/client";
import {
  CreateSharingPermissionDto,
  UpdateSharingPermissionDto,
} from "./sharing.dto";

export class SharingRepository {
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

  async getSharingPermissionById(patientId: string, permissionId: string) {
    return prisma.medicalRecordSharingPermission.findFirst({
      where: {
        id: permissionId,
        patientId,
        revokedAt: null,
      },
    });
  }

  async updateSharingPermission(
    patientId: string,
    permissionId: string,
    data: UpdateSharingPermissionDto,
  ) {
    return prisma.medicalRecordSharingPermission.update({
      where: {
        id: permissionId,
        patientId,
        revokedAt: null,
      },
      data: {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : data.expiresAt,
      },
    });
  }

  async revokeSharingPermission(patientId: string, permissionId: string) {
    return prisma.medicalRecordSharingPermission.update({
      where: {
        id: permissionId,
        patientId,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  // Helper to get shared entity details by internal ID
  async getPatientProfileById(profileId: string) {
    return prisma.patientProfile.findFirst({
      where: { id: profileId },
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

  // Helper to get patient profile by qrCode (PAT-XXXXXXXX)
  async getPatientProfileByPatientId(patientId: string) {
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

  // Get permissions granted TO a user (permissions where they are the recipient)
  async getReceivedPermissions(profileId: string) {
    return prisma.medicalRecordSharingPermission.findMany({
      where: {
        sharedWithId: profileId,
        sharedWithType: "FAMILY_MEMBER",
        revokedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            qrCode: true,
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

  // Check if a user has permission to access another patient's records
  async checkPermission(
    ownerProfileId: string,
    requesterProfileId: string,
    recordType: string,
  ) {
    return prisma.medicalRecordSharingPermission.findFirst({
      where: {
        patientId: ownerProfileId,
        sharedWithId: requesterProfileId,
        revokedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        AND: [
          {
            OR: [
              { recordType: RecordType.ALL },
              { recordType: recordType as RecordType },
            ],
          },
        ],
      },
    });
  }

  // Check if permission already exists (for duplicate prevention)
  async findExistingPermission(
    patientId: string,
    sharedWithId: string,
    recordType: string,
  ) {
    return prisma.medicalRecordSharingPermission.findFirst({
      where: {
        patientId,
        sharedWithId,
        recordType: recordType as RecordType,
        revokedAt: null,
      },
    });
  }
}

export default new SharingRepository();
