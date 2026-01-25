import prisma from "@config/database";
import { UpdateDoctorProfileDto } from "./profile.dto";

export class DoctorProfileRepository {
  // Get doctor profile by user ID
  async findByUserId(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        doctorProfile: true,
      },
    });
  }

  // Get doctor profile by doctor ID (DOC-XXXXXXX)
  async findByDoctorId(doctorId: string) {
    return prisma.doctorProfile.findUnique({
      where: { doctorId },
      include: {
        user: {
          select: {
            email: true,
            phoneNumber: true,
          },
        },
      },
    });
  }

  // Update doctor profile
  async updateProfile(userId: string, data: UpdateDoctorProfileDto) {
    const { licenseExpiryDate, ...restData } = data;

    return prisma.doctorProfile.update({
      where: { userId },
      data: {
        ...restData,
        licenseExpiryDate: licenseExpiryDate
          ? new Date(licenseExpiryDate)
          : undefined,
      },
    });
  }

  // Update profile picture
  async updateProfilePicture(userId: string, pictureUrl: string) {
    return prisma.doctorProfile.update({
      where: { userId },
      data: { profilePicture: pictureUrl },
    });
  }

  // Update license document
  async updateLicenseDocument(userId: string, documentUrl: string) {
    return prisma.doctorProfile.update({
      where: { userId },
      data: { licenseDocument: documentUrl },
    });
  }
}

export default new DoctorProfileRepository();
