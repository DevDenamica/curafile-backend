import prisma from "@config/database";
import { ClinicDoctorStatus } from "@prisma/client";

export class DoctorInvitationRepository {
  // Get doctor profile by userId
  async findDoctorByUserId(userId: string) {
    return prisma.doctorProfile.findUnique({
      where: { userId },
    });
  }

  // Get pending invitation for doctor
  async getPendingInvitations(doctorProfileId: string) {
    return prisma.clinicDoctor.findMany({
      where: {
        doctorId: doctorProfileId,
        status: ClinicDoctorStatus.PENDING,
        isDeleted: false,
      },
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
            city: true,
            country: true,
          },
        },
      },
      orderBy: {
        invitedAt: "desc",
      },
    });
  }

  // Get specific invitation by ID
  async getInvitationById(clinicDoctorId: string) {
    return prisma.clinicDoctor.findUnique({
      where: { id: clinicDoctorId },
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
            subscription: {
              select: {
                doctorSlots: true,
                usedSlots: true,
              },
            },
          },
        },
      },
    });
  }

  // Accept invitation
  async acceptInvitation(clinicDoctorId: string) {
    return prisma.clinicDoctor.update({
      where: { id: clinicDoctorId },
      data: {
        status: ClinicDoctorStatus.ACCEPTED,
        respondedAt: new Date(),
        addedAt: new Date(),
        isActive: true,
      },
    });
  }

  // Reject invitation
  async rejectInvitation(clinicDoctorId: string) {
    return prisma.clinicDoctor.update({
      where: { id: clinicDoctorId },
      data: {
        status: ClinicDoctorStatus.REJECTED,
        respondedAt: new Date(),
      },
    });
  }

  // Get doctor's affiliated clinics
  async getMyClinics(doctorProfileId: string) {
    return prisma.clinicDoctor.findMany({
      where: {
        doctorId: doctorProfileId,
        status: ClinicDoctorStatus.ACCEPTED,
        isDeleted: false,
      },
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
            city: true,
            country: true,
          },
        },
      },
      orderBy: {
        addedAt: "desc",
      },
    });
  }

  // Leave clinic (soft delete)
  async leaveClinic(clinicDoctorId: string) {
    return prisma.clinicDoctor.update({
      where: { id: clinicDoctorId },
      data: {
        isActive: false,
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  // Increment clinic's used slots
  async incrementUsedSlots(clinicId: string) {
    const subscription = await prisma.clinicSubscription.findUnique({
      where: { clinicId },
    });

    if (!subscription) {
      return null;
    }

    return prisma.clinicSubscription.update({
      where: { clinicId },
      data: {
        usedSlots: subscription.usedSlots + 1,
      },
    });
  }

  // Decrement clinic's used slots
  async decrementUsedSlots(clinicId: string) {
    const subscription = await prisma.clinicSubscription.findUnique({
      where: { clinicId },
    });

    if (!subscription) {
      return null;
    }

    return prisma.clinicSubscription.update({
      where: { clinicId },
      data: {
        usedSlots: Math.max(0, subscription.usedSlots - 1),
      },
    });
  }
}

export default new DoctorInvitationRepository();
