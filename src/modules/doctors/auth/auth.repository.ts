import prisma from "@config/database";
import { RoleType } from "@prisma/client";

export class DoctorAuthRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        doctorProfile: true,
        patientProfile: true,
        roles: true,
      },
    });
  }

  // Create a brand new doctor (no existing user)
  async createDoctor(data: {
    email: string;
    phoneNumber?: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    doctorId: string;
    specialization?: string;
    medicalLicenseNumber: string;
  }) {
    return prisma.user.create({
      data: {
        email: data.email,
        phoneNumber: data.phoneNumber,
        passwordHash: data.passwordHash,
        doctorProfile: {
          create: {
            doctorId: data.doctorId,
            firstName: data.firstName,
            lastName: data.lastName,
            specialization: data.specialization,
            medicalLicenseNumber: data.medicalLicenseNumber,
          },
        },
        roles: {
          create: {
            roleType: RoleType.DOCTOR,
          },
        },
      },
      include: {
        doctorProfile: true,
        roles: true,
      },
    });
  }

  // Add doctor role to existing user (who is already a patient)
  async addDoctorRoleToExistingUser(
    userId: string,
    data: {
      firstName: string;
      lastName: string;
      doctorId: string;
      specialization?: string;
      medicalLicenseNumber: string;
    },
  ) {
    // Create doctor profile and add role in a transaction
    return prisma.$transaction(async (tx) => {
      // Create doctor profile
      await tx.doctorProfile.create({
        data: {
          userId: userId,
          doctorId: data.doctorId,
          firstName: data.firstName,
          lastName: data.lastName,
          specialization: data.specialization,
          medicalLicenseNumber: data.medicalLicenseNumber,
        },
      });

      // Add DOCTOR role
      await tx.userRole.create({
        data: {
          userId: userId,
          roleType: RoleType.DOCTOR,
        },
      });

      // Return updated user
      return tx.user.findUnique({
        where: { id: userId },
        include: {
          doctorProfile: true,
          patientProfile: true,
          roles: true,
        },
      });
    });
  }

  // Check if user already has doctor role
  async hasDoctorRole(userId: string): Promise<boolean> {
    const role = await prisma.userRole.findFirst({
      where: {
        userId,
        roleType: RoleType.DOCTOR,
      },
    });
    return !!role;
  }

  async verifyEmail(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true },
      include: { doctorProfile: true },
    });
  }

  async updatePassword(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async generateDoctorId(): Promise<string> {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let doctorId: string;
    let exists = true;

    while (exists) {
      let randomPart = "";
      for (let i = 0; i < 8; i++) {
        randomPart += characters.charAt(
          Math.floor(Math.random() * characters.length),
        );
      }
      doctorId = `DOC-${randomPart}`;

      const existing = await prisma.doctorProfile.findUnique({
        where: { doctorId },
      });
      exists = !!existing;
    }

    return doctorId!;
  }
}

export default new DoctorAuthRepository();
