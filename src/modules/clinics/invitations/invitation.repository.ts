import prisma from "@config/database";
import { ClinicDoctorStatus, Prisma } from "@prisma/client";

export class InvitationRepository {
  // Find doctor by email
  async findDoctorByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        doctorProfile: {
          select: {
            id: true,
            doctorId: true,
            specialization: true,
          },
        },
      },
    });
  }

  // Find doctor by doctorId
  async findDoctorByDoctorId(doctorId: string) {
    return prisma.doctorProfile.findUnique({
      where: { doctorId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  // Check if invitation already exists
  async findExistingInvitation(clinicId: string, doctorId: string) {
    return prisma.clinicDoctor.findUnique({
      where: {
        clinicId_doctorId: {
          clinicId,
          doctorId,
        },
      },
    });
  }

  // Create invitation
  async createInvitation(data: {
    clinicId: string;
    doctorId: string;
    addedBy: string;
    consultationFee?: number;
    slotDuration?: number;
    schedule?: any;
    expiresAt: Date;
  }) {
    return prisma.clinicDoctor.create({
      data: {
        clinicId: data.clinicId,
        doctorId: data.doctorId,
        status: ClinicDoctorStatus.PENDING,
        addedBy: data.addedBy,
        consultationFee: data.consultationFee,
        slotDuration: data.slotDuration,
        schedule: data.schedule,
        expiresAt: data.expiresAt,
        isActive: false,
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        clinic: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  // Get all affiliated doctors for a clinic
  async getAffiliatedDoctors(clinicId: string, status?: ClinicDoctorStatus) {
    return prisma.clinicDoctor.findMany({
      where: {
        clinicId,
        status: status || undefined,
        isDeleted: false,
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // Get pending invitations for a clinic
  async getPendingInvitations(clinicId: string) {
    return this.getAffiliatedDoctors(clinicId, ClinicDoctorStatus.PENDING);
  }

  // Update affiliation
  async updateAffiliation(
    clinicDoctorId: string,
    data: Prisma.ClinicDoctorUpdateInput,
  ) {
    return prisma.clinicDoctor.update({
      where: {
        id: clinicDoctorId,
      },
      data,
    });
  }

  // Cancel invitation (soft delete)
  async cancelInvitation(clinicDoctorId: string) {
    return prisma.clinicDoctor.update({
      where: { id: clinicDoctorId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  // Remove doctor from clinic (soft delete)
  async removeDoctorFromClinic(clinicDoctorId: string) {
    return prisma.clinicDoctor.update({
      where: { id: clinicDoctorId },
      data: {
        isActive: false,
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  // Get clinic subscription
  async getClinicSubscription(clinicId: string) {
    return prisma.clinicSubscription.findUnique({
      where: { clinicId },
    });
  }

  // Update used slots
  async updateUsedSlots(clinicId: string, increment: boolean) {
    const subscription = await this.getClinicSubscription(clinicId);

    if (!subscription) {
      return null;
    }

    return prisma.clinicSubscription.update({
      where: { clinicId },
      data: {
        usedSlots: increment
          ? subscription.usedSlots + 1
          : Math.max(0, subscription.usedSlots - 1),
      },
    });
  }
}

export default new InvitationRepository();
