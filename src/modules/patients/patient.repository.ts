import prisma from "@config/database";
import { Patient } from "@prisma/client";
import { CompleteRegistrationDto } from "./patient.dto";

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
        countyResidence: data.countyResidence,
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
}

export default new PatientRepository();
