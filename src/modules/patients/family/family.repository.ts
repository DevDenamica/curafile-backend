import prisma from "@config/database";
import { AddFamilyMemberDto } from "./family.dto";

export class FamilyRepository {
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

  async getFamilyMembers(primaryPatientId: string) {
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
        primaryPatientId,
      },
      data: permissions,
    });
  }

  async removeFamilyMember(primaryPatientId: string, familyRelationId: string) {
    return prisma.patientFamily.delete({
      where: {
        id: familyRelationId,
        primaryPatientId,
      },
    });
  }
}

export default new FamilyRepository();
