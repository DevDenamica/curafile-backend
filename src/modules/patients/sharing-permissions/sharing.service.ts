import sharingRepository from "./sharing.repository";
import patientRepository from "../shared/patient.repository";
import {
  CreateSharingPermissionDto,
  SharingPermissionResponse,
} from "./sharing.dto";
import { NotFoundError } from "@/shared/exceptions/AppError";
import logger from "@shared/utils/logger";

export class SharingService {
  async createSharingPermission(
    userId: string,
    data: CreateSharingPermissionDto,
  ): Promise<SharingPermissionResponse> {
    try {
      const user = await patientRepository.findById(userId);
      if (!user || !user.patientProfile) {
        throw new NotFoundError("Patient profile not found");
      }

      const permission = await sharingRepository.createSharingPermission(
        user.patientProfile.id,
        data,
      );

      logger.info(
        `Sharing permission created for patient ${user.patientProfile.qrCode}`,
      );
      return {
        id: permission.id,
        recordType: permission.recordType,
        canView: permission.canView,
        canDownload: permission.canDownload,
        expiresAt: permission.expiresAt,
        createdAt: permission.createdAt,
        revokedAt: permission.revokedAt,
      };
    } catch (error: any) {
      logger.error("Error creating sharing permission:", error.message);
      throw error;
    }
  }

  async getSharingPermissions(
    userId: string,
  ): Promise<SharingPermissionResponse[]> {
    try {
      const user = await patientRepository.findById(userId);
      if (!user || !user.patientProfile) {
        throw new NotFoundError("Patient profile not found");
      }

      const permissions = await sharingRepository.getSharingPermissions(
        user.patientProfile.id,
      );
      return permissions.map((p) => ({
        id: p.id,
        recordType: p.recordType,
        canView: p.canView,
        canDownload: p.canDownload,
        expiresAt: p.expiresAt,
        createdAt: p.createdAt,
        revokedAt: p.revokedAt,
      }));
    } catch (error: any) {
      logger.error("Error fetching sharing permissions:", error.message);
      throw error;
    }
  }

  async revokeSharingPermission(
    userId: string,
    permissionId: string,
  ): Promise<{ message: string }> {
    try {
      const user = await patientRepository.findById(userId);
      if (!user || !user.patientProfile) {
        throw new NotFoundError("Patient profile not found");
      }

      const permission = await sharingRepository.getSharingPermissionById(
        user.patientProfile.id,
        permissionId,
      );
      if (!permission) {
        throw new NotFoundError("Sharing permission not found");
      }

      await sharingRepository.revokeSharingPermission(
        user.patientProfile.id,
        permissionId,
      );

      logger.info(`Sharing permission ${permissionId} revoked`);
      return { message: "Sharing permission revoked successfully" };
    } catch (error: any) {
      logger.error("Error revoking sharing permission:", error.message);
      throw error;
    }
  }
}

export default new SharingService();
