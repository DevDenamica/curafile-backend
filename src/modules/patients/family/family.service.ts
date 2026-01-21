import familyRepository from "./family.repository";
import patientRepository from "../shared/patient.repository";
import {
  AddFamilyMemberDto,
  FamilyMemberResponse,
} from "./family.dto";
import { NotFoundError } from "@/shared/exceptions/AppError";
import logger from "@shared/utils/logger";

export class FamilyService {
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
      const familyMemberProfile =
        await familyRepository.findPatientProfileByPatientId(
          data.familyMemberPatientId,
        );
      if (!familyMemberProfile) {
        throw new NotFoundError("Family member not found with this patient ID");
      }

      // Create relation using internal database ID
      const relation = await familyRepository.addFamilyMember(
        user.patientProfile.id,
        familyMemberProfile.id,
        {
          relationship: data.relationship,
          canViewMedicalRecords: data.canViewMedicalRecords,
          canBookAppointments: data.canBookAppointments,
        },
      );

      logger.info(
        `Family member added for patient ${user.patientProfile.qrCode}`,
      );
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

  async getFamilyMembers(userId: string): Promise<FamilyMemberResponse[]> {
    try {
      const user = await patientRepository.findById(userId);
      if (!user || !user.patientProfile) {
        throw new NotFoundError("Patient profile not found");
      }

      const relations = await familyRepository.getFamilyMembers(
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

      const relation = await familyRepository.getFamilyMemberById(
        user.patientProfile.id,
        familyRelationId,
      );
      if (!relation) {
        throw new NotFoundError("Family relationship not found");
      }

      await familyRepository.updateFamilyMemberPermissions(
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

      const relation = await familyRepository.getFamilyMemberById(
        user.patientProfile.id,
        familyRelationId,
      );
      if (!relation) {
        throw new NotFoundError("Family relationship not found");
      }

      await familyRepository.removeFamilyMember(
        user.patientProfile.id,
        familyRelationId,
      );

      logger.info(
        `Family member removed for patient ${user.patientProfile.qrCode}`,
      );
      return { message: "Family member removed successfully" };
    } catch (error: any) {
      logger.error("Error removing family member:", error.message);
      throw error;
    }
  }
}

export default new FamilyService();
