import prisma from "@/config/database";
import { RoleType } from "@prisma/client";

// Find user with doctor profile by user ID
export class DoctorRepository {
  // Find user with doctor profile by user ID
  async findById(userId: string) {
    return prisma.user.findFirst({
      where: {
        id: userId,
        isDeleted: false,
      },
      include: {
        doctorProfile: true,
      },
    });
  }

  // Find doctor profile by doctorId (DOC-XXXXXXX)
  async findDoctorId(doctorId: string) {
    return prisma.doctorProfile.findFirst({
      where: {
        doctorId,
        isDeleted: false,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });
  }

  // Find user by email (for login/registration)
  async findByEmail(email: string) {
    return prisma.user.findFirst({
      where: {
        email,
        isDeleted: false,
      },
      include: {
        doctorProfile: true,
      },
    });
  }

  // Find user by phone number (for login)
  async findByPhoneNumber(phoneNumber: string) {
    return prisma.user.findFirst({
      where: {
        phoneNumber,
        isDeleted: false,
      },
      include: {
        doctorProfile: true,
      },
    });
  }

  // Create new doctor (user + profile + role in one transaction)
  async createDoctor(data: {
    email: string;
    phoneNumber?: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    doctorId: string;
    specialization?: string;
  }) {
    return prisma.user.create({
      data: {
        email: data.email,
        phoneNumber: data.phoneNumber,
        passwordHash: data.passwordHash,
        // Create doctor profile
        doctorProfile: {
          create: {
            doctorId: data.doctorId,
            firstName: data.firstName,
            lastName: data.lastName,
            specialization: data.specialization,
          },
        },
        // Assign DOCTOR role
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

  // Generate unique doctor ID (DOC-XXXXXX)
  async generateDoctorId(): Promise<string> {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let doctorId: string;
    let exists = true;

    while (exists) {
      const randomPart = Array.from({ length: 8 }, () =>
        characters.charAt(Math.floor(Math.random() * characters.length)),
      ).join("");
      doctorId = `DOC-${randomPart}`;

      const existing = await prisma.doctorProfile.findFirst({
        where: {
          doctorId,
        },
      });
      exists = !!existing;
    }
    return doctorId!;
  }
}

export default new DoctorRepository();
