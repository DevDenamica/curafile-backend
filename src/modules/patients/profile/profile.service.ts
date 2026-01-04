import patientRepository from "../shared/patient.repository";
import { UpdatePatientProfileDto, PatientProfileResponse } from "./profile.dto";
import { NotFoundError } from "@shared/exceptions/AppError";
import type { Patient } from "@prisma/client";

export class ProfileService {
  /**
   * Get patient profile (extended version with all fields)
   */
  async getProfile(patientId: string): Promise<PatientProfileResponse> {
    const patient = await patientRepository.findById(patientId);
    if (!patient) {
      throw new NotFoundError("Patient not found");
    }

    return this.toPatientProfileResponse(patient);
  }

  /**
   * Update patient profile
   */
  async updateProfile(
    patientId: string,
    data: UpdatePatientProfileDto
  ): Promise<PatientProfileResponse> {
    // Check if patient exists
    const existingPatient = await patientRepository.findById(patientId);
    if (!existingPatient) {
      throw new NotFoundError("Patient not found");
    }

    // Update profile
    const updatedPatient = await patientRepository.updateProfile(
      patientId,
      data
    );

    return this.toPatientProfileResponse(updatedPatient);
  }

  // Helper: Convert Patient to PatientProfileResponse (extended version)
  private toPatientProfileResponse(patient: Patient): PatientProfileResponse {
    return {
      id: patient.id,
      patientId: patient.patientId,
      fullName: patient.fullName,
      email: patient.email,
      phoneNumber: patient.phoneNumber,
      countryResidence: patient.countryResidence,
      nationality: patient.nationality,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      address: patient.address,
      city: patient.city,
      zipCode: patient.zipCode,
      emergencyContact: patient.emergencyContact,
      emergencyPhone: patient.emergencyPhone,
      bloodType: patient.bloodType,
      allergies: patient.allergies,
      chronicConditions: patient.chronicConditions,
      profilePhoto: patient.profilePhoto,
      emailVerified: patient.emailVerified,
      termsAccepted: patient.termsAccepted,
      isActive: patient.isActive,
      createdAt: patient.createdAt,
    };
  }
}

export default new ProfileService();
