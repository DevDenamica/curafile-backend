import prisma from "@config/database";
import { Patient } from "@prisma/client";
import { CompleteRegistrationDto } from "../auth/auth.dto";
import { UpdatePatientProfileDto } from "../profile/profile.dto";

export class PatientRepository {
  async findByEmail(email: string): Promise<Patient | null> {
    return prisma.patient.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<Patient | null> {
    return prisma.patient.findUnique({
      where: { id },
    });
  }

  async create(
    data: CompleteRegistrationDto & { hashedPassword: string }
  ): Promise<Patient> {
    // Generate unique patient ID
    const count = await prisma.patient.count();
    const patientId = `PAT-${String(count + 1).padStart(6, "0")}`;

    return prisma.patient.create({
      data: {
        patientId,
        fullName: data.fullName,
        email: data.email,
        password: data.hashedPassword,
        phoneNumber: data.phoneNumber,
        countryResidence: data.countryResidence,
        nationality: data.nationality,
        emailVerified: true, // Email is already verified via OTP
      },
    });
  }

  async acceptTerms(email: string): Promise<Patient> {
    return prisma.patient.update({
      where: { email },
      data: {
        termsAccepted: true,
        termsAcceptedAt: new Date(),
      },
    });
  }

  async updatePassword(id: string, hashedPassword: string): Promise<Patient> {
    return prisma.patient.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  // Update patient profile
  // @param id - Patient ID
  // @param data - Fields to update
  // @return Updated patient

  async updateProfile(
    id: string,
    data: UpdatePatientProfileDto
  ): Promise<Patient> {
    // Extract dateOfBirth from data to handle separately
    const { dateOfBirth, ...restData } = data;

    return prisma.patient.update({
      where: { id },
      data: {
        ...restData,
        // Convert dateOfBirth string to Date if provided
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        updatedAt: new Date(),
      },
    });
  }

  // Delete patient account (soft delete)
  // @param id - Patient ID
  // @returns Updated patient with isActive = false

  async softDelete(id: string): Promise<Patient> {
    return prisma.patient.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
  }

  // ⚠️ PERMANENTLY DELETE PATIENT ACCOUNT - DO NOT USE IN PRODUCTION! ⚠️
  // WARNING: This should NEVER be used in a medical system!
  // Reasons:
  // 1. Medical records must be retained for legal compliance (HIPAA, etc.)
  // 2. Patient safety - historical data needed for future care
  // 3. Legal protection - records needed for malpractice cases
  // 4. Research & analytics - de-identified data for medical research
  //
  // ✅ USE softDelete() instead for GDPR "right to be forgotten" compliance
  //    while preserving critical medical history.
  //
  // This method exists ONLY for testing/development purposes.
  // @param id - Patient ID

  async hardDelete(id: string): Promise<void> {
    await prisma.patient.delete({
      where: { id },
    });
  }

  // Reactivate soft-delete account
  // @param id - Patient ID

  async reactivate(id: string): Promise<Patient> {
    return prisma.patient.update({
      where: { id },
      data: {
        isActive: true,
        updatedAt: new Date(),
      },
    });
  }
}

export default new PatientRepository();
