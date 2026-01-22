import sharingRepository from "./sharing.repository";
import patientRepository from "../shared/patient.repository";
import {
  CreateSharingPermissionDto,
  UpdateSharingPermissionDto,
  SharingPermissionResponse,
  SharedWithDetails,
  ReceivedPermissionResponse,
} from "./sharing.dto";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
} from "@/shared/exceptions/AppError";
import logger from "@shared/utils/logger";

export class SharingService {
  // Helper to get shared with details based on type
  private async getSharedWithDetails(
    sharedWithType: string,
    sharedWithId: string | null,
  ): Promise<SharedWithDetails | null> {
    if (!sharedWithId) return null;

    if (sharedWithType === "FAMILY_MEMBER") {
      const profile = await sharingRepository.getPatientProfileById(sharedWithId);
      if (profile) {
        return {
          id: profile.id,
          name: `${profile.firstName} ${profile.lastName}`,
          email: profile.user.email,
          phoneNumber: profile.user.phoneNumber,
          type: "FAMILY_MEMBER",
        };
      }
    }

    // TODO: Add DOCTOR and CLINIC lookups when those modules are implemented
    // For now, return basic info
    return {
      id: sharedWithId,
      name: sharedWithType,
      type: sharedWithType as "DOCTOR" | "CLINIC" | "FAMILY_MEMBER",
    };
  }

  private async mapPermissionToResponse(
    permission: any,
  ): Promise<SharingPermissionResponse> {
    const sharedWith = await this.getSharedWithDetails(
      permission.sharedWithType,
      permission.sharedWithId,
    );

    return {
      id: permission.id,
      sharedWithType: permission.sharedWithType,
      sharedWithId: permission.sharedWithId,
      sharedWith,
      recordType: permission.recordType,
      canView: permission.canView,
      canDownload: permission.canDownload,
      expiresAt: permission.expiresAt,
      createdAt: permission.createdAt,
      revokedAt: permission.revokedAt,
    };
  }

  async createSharingPermission(
    userId: string,
    data: CreateSharingPermissionDto,
  ): Promise<SharingPermissionResponse> {
    try {
      const user = await patientRepository.findById(userId);
      if (!user || !user.patientProfile) {
        throw new NotFoundError("Patient profile not found");
      }

      let sharedWithInternalId = data.sharedWithId;

      // Validate and convert sharedWithId for FAMILY_MEMBER type
      // User passes patientId (PAT-XXXXXXXX), we store internal profile ID
      if (data.sharedWithType === "FAMILY_MEMBER" && data.sharedWithId) {
        const familyMember =
          await sharingRepository.getPatientProfileByPatientId(data.sharedWithId);
        if (!familyMember) {
          throw new NotFoundError(
            "Family member not found with this patient ID",
          );
        }
        sharedWithInternalId = familyMember.id;

        // Prevent sharing with yourself
        if (sharedWithInternalId === user.patientProfile.id) {
          throw new BadRequestError("You cannot share records with yourself");
        }
      }

      // Check for duplicate permission
      const existingPermission = await sharingRepository.findExistingPermission(
        user.patientProfile.id,
        sharedWithInternalId,
        data.recordType,
      );
      if (existingPermission) {
        throw new ConflictError(
          "A sharing permission already exists for this recipient and record type",
        );
      }

      const permission = await sharingRepository.createSharingPermission(
        user.patientProfile.id,
        {
          ...data,
          sharedWithId: sharedWithInternalId,
        },
      );

      logger.info(
        `Sharing permission created for patient ${user.patientProfile.qrCode}`,
      );

      return this.mapPermissionToResponse(permission);
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

      return Promise.all(
        permissions.map((p) => this.mapPermissionToResponse(p)),
      );
    } catch (error: any) {
      logger.error("Error fetching sharing permissions:", error.message);
      throw error;
    }
  }

  async updateSharingPermission(
    userId: string,
    permissionId: string,
    data: UpdateSharingPermissionDto,
  ): Promise<SharingPermissionResponse> {
    try {
      const user = await patientRepository.findById(userId);
      if (!user || !user.patientProfile) {
        throw new NotFoundError("Patient profile not found");
      }

      const existingPermission = await sharingRepository.getSharingPermissionById(
        user.patientProfile.id,
        permissionId,
      );
      if (!existingPermission) {
        throw new NotFoundError("Sharing permission not found");
      }

      const updatedPermission = await sharingRepository.updateSharingPermission(
        user.patientProfile.id,
        permissionId,
        data,
      );

      logger.info(`Sharing permission ${permissionId} updated`);

      return this.mapPermissionToResponse(updatedPermission);
    } catch (error: any) {
      logger.error("Error updating sharing permission:", error.message);
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

  async getReceivedPermissions(
    userId: string,
  ): Promise<ReceivedPermissionResponse[]> {
    try {
      const user = await patientRepository.findById(userId);
      if (!user || !user.patientProfile) {
        throw new NotFoundError("Patient profile not found");
      }

      const permissions = await sharingRepository.getReceivedPermissions(
        user.patientProfile.id,
      );

      return permissions.map((permission) => ({
        id: permission.id,
        sharedBy: {
          id: permission.patient.id,
          patientId: permission.patient.qrCode,
          name: `${permission.patient.firstName} ${permission.patient.lastName}`,
          email: permission.patient.user.email,
          phoneNumber: permission.patient.user.phoneNumber,
        },
        recordType: permission.recordType,
        canView: permission.canView,
        canDownload: permission.canDownload,
        expiresAt: permission.expiresAt,
        createdAt: permission.createdAt,
      }));
    } catch (error: any) {
      logger.error("Error fetching received permissions:", error.message);
      throw error;
    }
  }

  // Check if user has permission to access another patient's records
  // Returns the permission if access is granted, throws ForbiddenError if not
  async verifyAccess(
    requesterUserId: string,
    ownerPatientId: string, // PAT-XXXXXXXX format
    recordType: string,
  ): Promise<{ canView: boolean; canDownload: boolean; ownerProfileId: string }> {
    try {
      const requester = await patientRepository.findById(requesterUserId);
      if (!requester || !requester.patientProfile) {
        throw new NotFoundError("Patient profile not found");
      }

      const owner =
        await sharingRepository.getPatientProfileByPatientId(ownerPatientId);
      if (!owner) {
        throw new NotFoundError("Patient not found with this ID");
      }

      const permission = await sharingRepository.checkPermission(
        owner.id,
        requester.patientProfile.id,
        recordType,
      );

      if (!permission) {
        throw new ForbiddenError(
          "You do not have permission to access this patient's records",
        );
      }

      if (!permission.canView) {
        throw new ForbiddenError(
          "You do not have view permission for this patient's records",
        );
      }

      return {
        canView: permission.canView,
        canDownload: permission.canDownload,
        ownerProfileId: owner.id,
      };
    } catch (error: any) {
      logger.error("Error verifying access permission:", error.message);
      throw error;
    }
  }
}

export default new SharingService();
