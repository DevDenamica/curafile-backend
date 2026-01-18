import prisma from "@config/database";
import { User, PatientProfile, RoleType } from "@prisma/client";
import { CompleteRegistrationDto } from "../auth/auth.dto";
import { UpdatePatientProfileDto } from "../profile/profile.dto";
import { v4 as uuidv4 } from "uuid";

// Combined type for User with PatientProfile
export type UserWithProfile = User & {
  patientProfile: PatientProfile | null;
};

export class PatientRepository {
  async findByEmail(email: string): Promise<UserWithProfile | null> {
    return prisma.user.findUnique({
      where: { email },
      include: { patientProfile: true },
    });
  }

  async findById(id: string): Promise<UserWithProfile | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { patientProfile: true },
    });
  }

  async create(
    data: CompleteRegistrationDto & { hashedPassword: string }
  ): Promise<UserWithProfile> {
    // Generate unique QR code for patient profile
    const qrCode = `PAT-${uuidv4().slice(0, 8).toUpperCase()}`;

    return prisma.user.create({
      data: {
        email: data.email,
        phoneNumber: data.phoneNumber,
        passwordHash: data.hashedPassword,
        isEmailVerified: true,
        roles: {
          create: {
            roleType: RoleType.PATIENT,
          },
        },
        patientProfile: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            nationality: data.nationality,
            qrCode,
          },
        },
      },
      include: { patientProfile: true },
    });
  }

  async acceptTerms(userId: string, termsVersionId: string): Promise<void> {
    await prisma.termsAcceptance.create({
      data: {
        userId,
        termsVersionId,
      },
    });
  }

  async hasAcceptedTerms(userId: string): Promise<boolean> {
    const acceptance = await prisma.termsAcceptance.findFirst({
      where: { userId },
      orderBy: { acceptedAt: "desc" },
    });
    return !!acceptance;
  }

  async updatePassword(id: string, hashedPassword: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { passwordHash: hashedPassword },
    });
  }

  async updateProfile(
    userId: string,
    data: UpdatePatientProfileDto
  ): Promise<PatientProfile> {
    const { dateOfBirth, ...restData } = data;

    return prisma.patientProfile.update({
      where: { userId },
      data: {
        ...restData,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      },
    });
  }

  async softDelete(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async hardDelete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }

  async reactivate(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        isActive: true,
        isDeleted: false,
        deletedAt: null,
      },
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }
}

export default new PatientRepository();
