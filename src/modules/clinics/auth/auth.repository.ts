import prisma from "@config/database";
import { RoleType } from "@prisma/client";

export interface CreateClinicData {
  email: string;
  phoneNumber?: string;
  passwordHash: string;
  clinicName: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  licenseNumber: string;
  specializations?: string[];
}

export class ClinicAuthRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        roles: true,
        clinicsOwned: {
          where: { isDeleted: false },
          select: {
            id: true,
            name: true,
            isVerified: true,
            isActive: true,
          },
        },
      },
    });
  }

  async createClinic(data: CreateClinicData) {
    return prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: data.email,
          phoneNumber: data.phoneNumber,
          passwordHash: data.passwordHash,
          isEmailVerified: false,
          isActive: true,
        },
      });

      // Create clinic staff role
      await tx.userRole.create({
        data: {
          userId: user.id,
          roleType: RoleType.CLINIC_STAFF,
        },
      });

      // Create clinic
      const clinic = await tx.clinic.create({
        data: {
          ownerId: user.id,
          name: data.clinicName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          country: data.country,
          licenseNumber: data.licenseNumber,
          specializations: data.specializations,
          isVerified: false,
          isActive: true,
        },
      });

      return {
        user,
        clinic,
      };
    });
  }

  async verifyEmail(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true },
    });
  }

  async updatePassword(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async hasClinicStaffRole(userId: string): Promise<boolean> {
    const role = await prisma.userRole.findFirst({
      where: {
        userId,
        roleType: RoleType.CLINIC_STAFF,
        isActive: true,
      },
    });

    return !!role;
  }
}

export default new ClinicAuthRepository();
