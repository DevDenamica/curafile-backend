import patientRepository, {
  UserWithProfile,
} from "../shared/patient.repository";
import { UpdatePatientProfileDto, PatientProfileResponse } from "./profile.dto";
import { NotFoundError } from "@shared/exceptions/AppError";

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth: Date | null): number | null => {
  if (!dateOfBirth) return null;
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
};

export class ProfileService {
  async getProfile(userId: string): Promise<PatientProfileResponse> {
    console.log("ProfileService.getProfile called for userId:", userId);
    const user = await patientRepository.findById(userId);
    if (!user || !user.patientProfile) {
      throw new NotFoundError("Patient profile not found");
    }

    const response = this.toProfileResponse(user);
    console.log("ProfileService.getProfile returning:", JSON.stringify(response, null, 2));
    return response;
  }

  async updateProfile(
    userId: string,
    data: UpdatePatientProfileDto,
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
      patientId: profile.qrCode,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      dateOfBirth: profile.dateOfBirth,
      age: calculateAge(profile.dateOfBirth),
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
      covidVaccinated: profile.covidVaccinated,
      qrCodeUrl: profile.qrCodeImageUrl,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}

export default new ProfileService();
