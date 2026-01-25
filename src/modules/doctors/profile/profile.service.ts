import profileRepository from "./profile.repository";
import { UpdateDoctorProfileDto, DoctorProfileResponse } from "./profile.dto";
import { NotFoundError } from "@/shared/exceptions/AppError";
import logger from "@shared/utils/logger";

export class DoctorProfileService {
  // Get current doctor's profile
  async getProfile(userId: string): Promise<DoctorProfileResponse> {
    const user = await profileRepository.findByUserId(userId);

    if (!user || !user.doctorProfile) {
      throw new NotFoundError("Doctor profile not found");
    }

    return this.toProfileResponse(user);
  }

  // Update doctor's profile
  async updateProfile(
    userId: string,
    data: UpdateDoctorProfileDto,
  ): Promise<DoctorProfileResponse> {
    const user = await profileRepository.findByUserId(userId);

    if (!user || !user.doctorProfile) {
      throw new NotFoundError("Doctor profile not found");
    }

    await profileRepository.updateProfile(userId, data);

    // Fetch updated profile
    const updatedUser = await profileRepository.findByUserId(userId);

    logger.info(`Doctor profile updated: ${user.email}`);

    return this.toProfileResponse(updatedUser!);
  }

  // Get doctor profile by doctor ID (public - for patients to view)
  async getProfileByDoctorId(doctorId: string): Promise<DoctorProfileResponse> {
    const profile = await profileRepository.findByDoctorId(doctorId);

    if (!profile) {
      throw new NotFoundError("Doctor not found");
    }

    return {
      id: profile.id,
      doctorId: profile.doctorId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.user.email,
      phoneNumber: profile.user.phoneNumber,
      specialization: profile.specialization,
      subSpecialization: profile.subSpecialization,
      yearsOfExperience: profile.yearsOfExperience,
      medicalLicenseNumber: profile.medicalLicenseNumber,
      licenseExpiryDate: profile.licenseExpiryDate,
      biography: profile.biography,
      languages: profile.languages as string[] | null,
      profilePicture: profile.profilePicture,
      isVerified: profile.isVerified,
      rating: profile.rating ? Number(profile.rating) : null,
      totalConsultations: profile.totalConsultations,
      createdAt: profile.createdAt,
    };
  }

  // Convert database result to response format
  private toProfileResponse(user: any): DoctorProfileResponse {
    const profile = user.doctorProfile;

    return {
      id: profile.id,
      doctorId: profile.doctorId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      specialization: profile.specialization,
      subSpecialization: profile.subSpecialization,
      yearsOfExperience: profile.yearsOfExperience,
      medicalLicenseNumber: profile.medicalLicenseNumber,
      licenseExpiryDate: profile.licenseExpiryDate,
      biography: profile.biography,
      languages: profile.languages as string[] | null,
      profilePicture: profile.profilePicture,
      isVerified: profile.isVerified,
      rating: profile.rating ? Number(profile.rating) : null,
      totalConsultations: profile.totalConsultations,
      createdAt: profile.createdAt,
    };
  }
}

export default new DoctorProfileService();
