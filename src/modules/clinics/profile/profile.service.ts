import profileRepository from "./profile.repository";
import { NotFoundError, ForbiddenError } from "@shared/exceptions/AppError";
import logger from "@/shared/utils/logger";
import { UpdateClinicProfileDto, ClinicProfileResponse } from "./profile.dto";

export class ClinicProfileService {
  async getProfile(userId: string): Promise<ClinicProfileResponse> {
    const clinic = await profileRepository.findByOwnerId(userId);

    if (!clinic) {
      throw new NotFoundError("Clinic profile not found");
    }

    return this.toProfileResponse(clinic);
  }

  async updateProfile(
    userId: string,
    data: UpdateClinicProfileDto,
  ): Promise<ClinicProfileResponse> {
    const clinic = await profileRepository.findByOwnerId(userId);

    if (!clinic) {
      throw new NotFoundError("Clinic profile not found");
    }

    let updateData: any = { ...data };

    if (data.openingTime) {
      updateData.openingTime = new Date(`1970-01-01T${data.openingTime}:00Z`);
    }

    if (data.closingTime) {
      updateData.closingTime = new Date(`1970-01-01T${data.closingTime}:00Z`);
    }

    const updatedClinic = await profileRepository.updateProfile(
      clinic.id,
      updateData,
    );

    logger.info(`Clinic profile updated: ${clinic.id}`);

    return this.toProfileResponse(updatedClinic);
  }

  async getProfileByClinicId(clinicId: string): Promise<ClinicProfileResponse> {
    const clinic = await profileRepository.findByClinicId(clinicId);

    if (!clinic) {
      throw new NotFoundError("Clinic not found");
    }

    return this.toProfileResponse(clinic);
  }

  private toProfileResponse(clinic: any): ClinicProfileResponse {
    return {
      id: clinic.id,
      ownerId: clinic.ownerId,
      name: clinic.name,
      email: clinic.email,
      phone: clinic.phone,
      address: clinic.address,
      city: clinic.city,
      country: clinic.country,
      latitude: clinic.latitude ? clinic.latitude.toString() : null,
      longitude: clinic.longitude ? clinic.longitude.toString() : null,
      specializations: Array.isArray(clinic.specializations)
        ? clinic.specializations
        : [],
      insuranceCompaniesAccepted: Array.isArray(
        clinic.insuranceCompaniesAccepted,
      )
        ? clinic.insuranceCompaniesAccepted
        : [],
      openingTime: clinic.openingTime
        ? clinic.openingTime.toISOString().substring(11, 16)
        : null,
      closingTime: clinic.closingTime
        ? clinic.closingTime.toISOString().substring(11, 16)
        : null,
      workingDays: Array.isArray(clinic.workingDays) ? clinic.workingDays : [],
      licenseNumber: clinic.licenseNumber,
      licenseDocument: clinic.licenseDocument,
      logoUrl: clinic.logoUrl,
      description: clinic.description,
      isActive: clinic.isActive,
      isVerified: clinic.isVerified,
      createdAt: clinic.createdAt,
      updatedAt: clinic.updatedAt,
      subscription: clinic.subscription || null,
    };
  }
}

export default new ClinicProfileService();
