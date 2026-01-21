import prisma from "@config/database";
import { CreateSharingPermissionDto } from "./sharing.dto";

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
}

export default new SharingRepository();
