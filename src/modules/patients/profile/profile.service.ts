import patientRepository, {
  UserWithProfile,
} from "../shared/patient.repository";
import {
  UpdatePatientProfileDto,
  PatientProfileResponse,
} from "./profile.dto";
import { NotFoundError } from "@shared/exceptions/AppError";

export class ProfileService {
  async getProfile(userId: string): Promise<PatientProfileResponse> {
    const user = await patientRepository.findById(userId);
    if (!user || !user.patientProfile) {
      throw new NotFoundError("Patient profile not found");
    }

    return this.toProfileResponse(user);
  }

  async updateProfile(
    userId: string,
    data: UpdatePatientProfileDto
  ): Promise<PatientProfileResponse> {
    const existingUser = await patientRepository.findById(userId);
    if (!existingUser || !existingUser.patientProfile) {
      throw new NotFoundError("Patient profile not found");
    }

    await patientRepository.updateProfile(userId, data);

    const updatedUser = await patientRepository.findById(userId);
    if (!updatedUser || !updatedUser.patientProfile) {
      throw new NotFoundError("Patient profile not found");
    }

    return this.toProfileResponse(updatedUser);
  }

  private toProfileResponse(user: UserWithProfile): PatientProfileResponse {
    const profile = user.patientProfile!;
    return {
      id: profile.id,
      userId: user.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      dateOfBirth: profile.dateOfBirth,
      gender: profile.gender,
      bloodType: profile.bloodType,
      nationalId: profile.nationalId,
      nationality: profile.nationality,
      profilePicture: profile.profilePicture,
      emergencyContactName: profile.emergencyContactName,
      emergencyContactPhone: profile.emergencyContactPhone,
      emergencyContactRelation: profile.emergencyContactRelation,
      insuranceCompanyName: profile.insuranceCompanyName,
      insurancePolicyNumber: profile.insurancePolicyNumber,
      insuranceMemberNumber: profile.insuranceMemberNumber,
      insuranceExpiryDate: profile.insuranceExpiryDate,
      insuranceCardFrontUrl: profile.insuranceCardFrontUrl,
      insuranceCardBackUrl: profile.insuranceCardBackUrl,
      allergies: profile.allergies as string[] | null,
      chronicConditions: profile.chronicConditions as string[] | null,
      currentMedications: profile.currentMedications as string[] | null,
      qrCode: profile.qrCode,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}

export default new ProfileService();
