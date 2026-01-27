import prisma from "@config/database";
import { Prisma } from "@prisma/client";

export class ClinicProfileRepository {
  async findByOwnerId(ownerId: string) {
    return prisma.clinic.findFirst({
      where: {
        ownerId,
        isDeleted: false,
      },
      include: {
        subscription: {
          select: {
            doctorSlots: true,
            usedSlots: true,
            status: true,
            endDate: true,
          },
        },
      },
    });
  }

  async findByClinicId(clinicId: string) {
    const clinic = await prisma.clinic.findUnique({
      where: {
        id: clinicId,
      },
      include: {
        subscription: {
          select: {
            doctorSlots: true,
            usedSlots: true,
            status: true,
            endDate: true,
          },
        },
      },
    });

    // Check if deleted after fetch
    if (clinic?.isDeleted) {
      return null;
    }

    return clinic;
  }

  async updateProfile(clinicId: string, data: Prisma.ClinicUpdateInput) {
    return prisma.clinic.update({
      where: {
        id: clinicId,
      },
      data,
      include: {
        subscription: {
          select: {
            doctorSlots: true,
            usedSlots: true,
            status: true,
            endDate: true,
          },
        },
      },
    });
  }

  async updateLogo(clinicId: string, logoUrl: string) {
    return prisma.clinic.update({
      where: {
        id: clinicId,
      },
      data: {
        logoUrl,
      },
    });
  }

  async uploadLicenseDocument(clinicId: string, documentUrl: string) {
    return prisma.clinic.update({
      where: {
        id: clinicId,
      },
      data: {
        licenseDocument: documentUrl,
      },
    });
  }
}

export default new ClinicProfileRepository();
