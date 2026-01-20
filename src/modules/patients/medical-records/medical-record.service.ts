import medicalRecordsRepository from "./medical-records.repository";
import patientRepository from "../shared/patient.repository";
import {
  CreateVaccinationRecordDto,
  UpdateVaccinationRecordDto,
  UploadMedicalDocumentDto,
  AddFamilyMemberDto,
  CreateSharingPermissionDto,
  VaccinationRecordResponse,
  MedicalDocumentResponse,
  FamilyMemberResponse,
  SharingPermissionResponse,
} from "./medical-records.dto";
import { NotFoundError } from "@/shared/exceptions/AppError";
import logger from "@shared/utils/logger";

export class MedicalRecordsService {
  // VACCINATION RECORDS

  async createVaccinationRecord(
    userId: string,
    data: CreateVaccinationRecordDto,
    administeredBy?: string,
  ): Promise<VaccinationRecordResponse> {
    try {
      const user = await patientRepository.findById(userId);
      if (!user || !user.patientProfile) {
        throw new NotFoundError("Patient profile not found");
      }

      const vaccinationRecord =
        await medicalRecordsRepository.createVaccinationRecord(
          user.patientProfile.id,
          data,
          administeredBy,
        );

      logger.info(`Vaccination record created for patient ${user.patientProfile.qrCode}`);
      return vaccinationRecord as VaccinationRecordResponse;
    } catch (error: any) {
      logger.error("Error creating vaccination record:", error.message);
      throw error;
    }
  }

  async getVaccinationRecords(
    userId: string,
  ): Promise<VaccinationRecordResponse[]> {
    try {
      const user = await patientRepository.findById(userId);
      if (!user || !user.patientProfile) {
        throw new NotFoundError("Patient profile not found");
      }

      const records = await medicalRecordsRepository.getVaccinationRecords(
        user.patientProfile.id,
      );
      return records as VaccinationRecordResponse[];
    } catch (error: any) {
      logger.error("Error fetching vaccination records", error.message);
      throw error;
    }
  }

  async updateVaccinationRecord(
    userId: string,
    recordId: string,
    data: UpdateVaccinationRecordDto,
  ): Promise<{ message: string }> {
    try {
      const user = await patientRepository.findById(userId);
      if (!user || !user.patientProfile) {
        throw new NotFoundError("Patient profile not found");
      }

      const existingRecord =
        await medicalRecordsRepository.getVaccinationRecordById(
          user.patientProfile.id,
          recordId,
        );
      if (!existingRecord) {
        throw new NotFoundError("Vaccination record not found");
      }

      await medicalRecordsRepository.updateVaccinationRecord(
        user.patientProfile.id,
        recordId,
        data,
      );

      logger.info(`Vaccination record ${recordId} updated`);
      return { message: "Vaccination record updated successfully" };
    } catch (error: any) {
      logger.error("Error updating vaccination record:", error.message);
      throw error;
    }
  }

  async deleteVaccinationRecord(
    userId: string,
    recordId: string,
  ): Promise<{ message: string }> {
    try {
      const user = await patientRepository.findById(userId);
      if (!user || !user.patientProfile) {
        throw new NotFoundError("Patient profile not found");
      }

      const existingRecord =
        await medicalRecordsRepository.getVaccinationRecordById(
          user.patientProfile.id,
          recordId,
        );
      if (!existingRecord) {
        throw new NotFoundError("Vaccination record not found");
      }

      await medicalRecordsRepository.deleteVaccinationRecord(
        user.patientProfile.id,
        recordId,
      );
      logger.info(`Vaccination record ${recordId} deleted`);
      return { message: "Vaccination record deleted successfully" };
    } catch (error: any) {
      logger.error("Error deleting vaccination record:", error.message);
      throw error;
    }
  }

  // MEDICAL DOCUMENTS

  async uploadMedicalDocument(
    userId: string,
    data: UploadMedicalDocumentDto,
  ): Promise<MedicalDocumentResponse> {
    try {
      const user = await patientRepository.findById(userId);
      if (!user || !user.patientProfile) {
        throw new NotFoundError("Patient profile not found");
      }

      const document = await medicalRecordsRepository.uploadMedicalDocument(
        user.patientProfile.id,
        data,
        userId,
      );

      logger.info(`Medical document uploaded for patient ${user.patientProfile.qrCode}`);
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

      const documents = await medicalRecordsRepository.getMedicalDocuments(
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

  // FAMILY MEMBERS

  async addFamilyMember(
    userId: string,
    data: AddFamilyMemberDto,
  ): Promise<FamilyMemberResponse> {
    try {
      const user = await patientRepository.findById(userId);
      if (!user || !user.patientProfile) {
        throw new NotFoundError("Patient profile not found");
      }

      // Look up family member by their patientId (qrCode like PAT-12345678)
      const familyMemberProfile = await medicalRecordsRepository.findPatientProfileByPatientId(
        data.familyMemberPatientId,
      );
      if (!familyMemberProfile) {
        throw new NotFoundError("Family member not found with this patient ID");
      }

      // Create relation using internal database ID
      const relation = await medicalRecordsRepository.addFamilyMember(
        user.patientProfile.id,
        familyMemberProfile.id,
        {
          relationship: data.relationship,
          canViewMedicalRecords: data.canViewMedicalRecords,
          canBookAppointments: data.canBookAppointments,
        },
      );

      logger.info(`Family member added for patient ${user.patientProfile.qrCode}`);
      return {
        id: relation.id,
        familyMemberPatientId: familyMemberProfile.qrCode,
        relationship: relation.relationship,
        canViewMedicalRecords: relation.canViewMedicalRecords,
        canBookAppointments: relation.canBookAppointments,
        createdAt: relation.createdAt,
        familyMemberDetails: {
          patientId: familyMemberProfile.qrCode,
          firstName: relation.familyMember.firstName,
          lastName: relation.familyMember.lastName,
          email: relation.familyMember.user.email,
          phoneNumber: relation.familyMember.user.phoneNumber,
        },
      };
    } catch (error: any) {
      logger.error("Error adding family member:", error.message);
      throw error;
    }
  }

  async getFamilyMembers(
    userId: string,
  ): Promise<FamilyMemberResponse[]> {
    try {
      const user = await patientRepository.findById(userId);
      if (!user || !user.patientProfile) {
        throw new NotFoundError("Patient profile not found");
      }

      const relations = await medicalRecordsRepository.getFamilyMembers(
        user.patientProfile.id,
      );
      return relations.map((relation) => ({
        id: relation.id,
        familyMemberPatientId: relation.familyMember.qrCode,
        relationship: relation.relationship,
        canViewMedicalRecords: relation.canViewMedicalRecords,
        canBookAppointments: relation.canBookAppointments,
        createdAt: relation.createdAt,
        familyMemberDetails: {
          patientId: relation.familyMember.qrCode,
          firstName: relation.familyMember.firstName,
          lastName: relation.familyMember.lastName,
          email: relation.familyMember.user.email,
          phoneNumber: relation.familyMember.user.phoneNumber,
        },
      }));
    } catch (error: any) {
      logger.error("Error fetching family members:", error.message);
      throw error;
    }
  }

  async updateFamilyMemberPermissions(
    userId: string,
    familyRelationId: string,
    permissions: {
      canViewMedicalRecords?: boolean;
      canBookAppointments?: boolean;
    },
  ): Promise<{ message: string }> {
    try {
      const user = await patientRepository.findById(userId);
      if (!user || !user.patientProfile) {
        throw new NotFoundError("Patient profile not found");
      }

      const relation = await medicalRecordsRepository.getFamilyMemberById(
        user.patientProfile.id,
        familyRelationId,
      );
      if (!relation) {
        throw new NotFoundError("Family relationship not found");
      }

      await medicalRecordsRepository.updateFamilyMemberPermissions(
        user.patientProfile.id,
        familyRelationId,
        permissions,
      );

      logger.info(`Family member permissions updated for ${familyRelationId}`);
      return { message: "Family member permissions updated successfully" };
    } catch (error: any) {
      logger.error("Error updating family member permissions:", error.message);
      throw error;
    }
  }

  async removeFamilyMember(
    userId: string,
    familyRelationId: string,
  ): Promise<{ message: string }> {
    try {
      const user = await patientRepository.findById(userId);
      if (!user || !user.patientProfile) {
        throw new NotFoundError("Patient profile not found");
      }

      const relation = await medicalRecordsRepository.getFamilyMemberById(
        user.patientProfile.id,
        familyRelationId,
      );
      if (!relation) {
        throw new NotFoundError("Family relationship not found");
      }

      await medicalRecordsRepository.removeFamilyMember(
        user.patientProfile.id,
        familyRelationId,
      );

      logger.info(`Family member removed for patient ${user.patientProfile.qrCode}`);
      return { message: "Family member removed successfully" };
    } catch (error: any) {
      logger.error("Error removing family member:", error.message);
      throw error;
    }
  }

  // SHARING PERMISSIONS

  async createSharingPermission(
    userId: string,
    data: CreateSharingPermissionDto,
  ): Promise<SharingPermissionResponse> {
    try {
      const user = await patientRepository.findById(userId);
      if (!user || !user.patientProfile) {
        throw new NotFoundError("Patient profile not found");
      }

      const permission = await medicalRecordsRepository.createSharingPermission(
        user.patientProfile.id,
        data,
      );

      logger.info(`Sharing permission created for patient ${user.patientProfile.qrCode}`);
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

      const permissions = await medicalRecordsRepository.getSharingPermissions(
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

      const permissions = await medicalRecordsRepository.getSharingPermissions(
        user.patientProfile.id,
      );
      const permission = permissions.find((p) => p.id === permissionId);
      if (!permission) {
        throw new NotFoundError("Sharing permission not found");
      }

      await medicalRecordsRepository.revokeSharingPermission(
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

export default new MedicalRecordsService();
