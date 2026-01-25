import prisma from "@config/database";
import { User, PatientProfile, RoleType } from "@prisma/client";
import { CompleteRegistrationDto } from "../auth/auth.dto";
import { UpdatePatientProfileDto } from "../profile/profile.dto";
import qrCodeService from "@shared/services/qrcode.service";

// Combined type for User with PatientProfile
export type UserWithProfile = User & {
  patientProfile: PatientProfile | null;
  doctorProfile?: { id: string } | null;
  roles?: { roleType: RoleType }[];
};

export class PatientRepository {
  async findByEmail(email: string): Promise<UserWithProfile | null> {
    return prisma.user.findUnique({
      where: { email },
      include: {
        patientProfile: true,
        doctorProfile: { select: { id: true } },
        roles: true,
      },
    });
  }

  async findById(id: string): Promise<UserWithProfile | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { patientProfile: true },
    });
  }

  private async generatePatientId(): Promise<string> {
    // Generate random numeric ID: PAT-XXXXXXXX (8 random digits)
    let patientId: string;
    let exists = true;

    // Keep generating until we get a unique ID
    while (exists) {
      const randomNumber = Math.floor(10000000 + Math.random() * 90000000); // 8-digit number
      patientId = `PAT-${randomNumber}`;

      // Check if this ID already exists
      const existing = await prisma.patientProfile.findFirst({
        where: { qrCode: patientId },
      });
      exists = !!existing;
    }

    return patientId!;
  }

  async create(
    data: CompleteRegistrationDto & { hashedPassword: string }
  ): Promise<UserWithProfile> {
    // Generate sequential patient ID
    const patientId = await this.generatePatientId();

    // Generate QR code image as base64 data URL
    const qrCodeImageUrl = await qrCodeService.generateDataUrl(patientId);

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
            dateOfBirth: new Date(data.dateOfBirth),
            covidVaccinated: data.covidVaccinated,
            qrCode: patientId,
            qrCodeImageUrl,
            qrCodeGeneratedAt: new Date(),
          },
        },
      },
      include: { patientProfile: true },
    });
  }

  // Add patient role to existing user (who is already a doctor)
  async addPatientRoleToExistingUser(
    userId: string,
    data: Omit<CompleteRegistrationDto, "email" | "password"> & {
      hashedPassword?: string;
    },
  ): Promise<UserWithProfile> {
    // Generate sequential patient ID
    const patientId = await this.generatePatientId();

    // Generate QR code image as base64 data URL
    const qrCodeImageUrl = await qrCodeService.generateDataUrl(patientId);

    // Create patient profile and add role in a transaction
    return prisma.$transaction(async (tx) => {
      // Create patient profile
      await tx.patientProfile.create({
        data: {
          userId: userId,
          firstName: data.firstName,
          lastName: data.lastName,
          nationality: data.nationality,
          dateOfBirth: new Date(data.dateOfBirth),
          covidVaccinated: data.covidVaccinated,
          qrCode: patientId,
          qrCodeImageUrl,
          qrCodeGeneratedAt: new Date(),
        },
      });

      // Add PATIENT role
      await tx.userRole.create({
        data: {
          userId: userId,
          roleType: RoleType.PATIENT,
        },
      });

      // Mark email as verified (doctor already verified)
      await tx.user.update({
        where: { id: userId },
        data: { isEmailVerified: true },
      });

      // Return updated user
      return tx.user.findUnique({
        where: { id: userId },
        include: { patientProfile: true },
      }) as Promise<UserWithProfile>;
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
    const { dateOfBirth, insuranceExpiryDate, ...restData } = data;

    return prisma.patientProfile.update({
      where: { userId },
      data: {
        ...restData,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        insuranceExpiryDate: insuranceExpiryDate
          ? new Date(insuranceExpiryDate)
          : undefined,
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
