import invitationRepository from "./invitation.repository";
import profileRepository from "../profile/profile.repository";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
} from "@shared/exceptions/AppError";
import logger from "@shared/utils/logger";
import {
  InviteDoctorDto,
  UpdateDoctorAffiliationDto,
  DoctorInvitationResponse,
  AffiliatedDoctorResponse,
} from "./invitation.dto";
import { ClinicDoctorStatus } from "@prisma/client";

export class InvitationService {
  // Invite doctor to clinic
  async inviteDoctor(
    userId: string,
    data: InviteDoctorDto,
  ): Promise<DoctorInvitationResponse> {
    // Get clinic
    const clinic = await profileRepository.findByOwnerId(userId);

    if (!clinic) {
      throw new NotFoundError("Clinic not found");
    }

    // Check subscription
    if (clinic.subscription) {
      const { doctorSlots, usedSlots } = clinic.subscription;
      if (usedSlots >= doctorSlots) {
        throw new ForbiddenError(
          `Subscription limit reached. You have ${usedSlots}/${doctorSlots} slots used. Please upgrade your plan.`,
        );
      }
    }

    // Find doctor by email or doctorId
    let doctorProfile;
    let doctorUserId;

    if (data.doctorEmail) {
      const user = await invitationRepository.findDoctorByEmail(
        data.doctorEmail,
      );
      if (!user || !user.doctorProfile) {
        throw new NotFoundError(
          "Doctor not found. Please ensure the doctor is registered.",
        );
      }
      doctorProfile = user.doctorProfile;
      doctorUserId = user.id;
    } else if (data.doctorId) {
      const doctor = await invitationRepository.findDoctorByDoctorId(
        data.doctorId,
      );
      if (!doctor) {
        throw new NotFoundError("Doctor not found with this ID");
      }
      doctorProfile = doctor;
      doctorUserId = doctor.user.id;
    } else {
      throw new BadRequestError("Either doctorEmail or doctorId is required");
    }

    // Check if invitation already exists
    const existingInvitation =
      await invitationRepository.findExistingInvitation(
        clinic.id,
        doctorProfile.id,
      );

    if (existingInvitation) {
      if (existingInvitation.status === ClinicDoctorStatus.ACCEPTED) {
        throw new ConflictError(
          "Doctor is already affiliated with this clinic",
        );
      }
      if (existingInvitation.status === ClinicDoctorStatus.PENDING) {
        throw new ConflictError(
          "Invitation already sent. Waiting for doctor's response.",
        );
      }
      if (existingInvitation.status === ClinicDoctorStatus.REJECTED) {
        throw new ConflictError(
          "Doctor previously rejected invitation. Please contact them directly.",
        );
      }
    }

    // Set expiry date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation
    const invitation = await invitationRepository.createInvitation({
      clinicId: clinic.id,
      doctorId: doctorProfile.id,
      addedBy: userId,
      consultationFee: data.consultationFee,
      slotDuration: data.slotDuration,
      schedule: data.schedule,
      expiresAt,
    });

    logger.info(
      `Clinic ${clinic.id} invited doctor ${doctorProfile.doctorId} (${doctorProfile.id})`,
    );

    return this.toDoctorInvitationResponse(invitation);
  }

  // Get all affiliated doctors
  async getAffiliatedDoctors(
    userId: string,
  ): Promise<AffiliatedDoctorResponse[]> {
    const clinic = await profileRepository.findByOwnerId(userId);

    if (!clinic) {
      throw new NotFoundError("Clinic not found");
    }

    const affiliations = await invitationRepository.getAffiliatedDoctors(
      clinic.id,
      ClinicDoctorStatus.ACCEPTED,
    );

    return affiliations.map(this.toAffiliatedDoctorResponse);
  }

  // Get pending invitations
  async getPendingInvitations(
    userId: string,
  ): Promise<DoctorInvitationResponse[]> {
    const clinic = await profileRepository.findByOwnerId(userId);

    if (!clinic) {
      throw new NotFoundError("Clinic not found");
    }

    const invitations = await invitationRepository.getPendingInvitations(
      clinic.id,
    );

    return invitations.map((inv) => ({
      id: inv.id,
      clinicId: inv.clinicId,
      clinicName: clinic.name,
      doctorId: inv.doctor.doctorId,
      doctorName: `${inv.doctor.firstName} ${inv.doctor.lastName}`,
      doctorEmail: inv.doctor.user.email,
      status: inv.status,
      invitedAt: inv.invitedAt,
      respondedAt: inv.respondedAt,
      expiresAt: inv.expiresAt,
      consultationFee: inv.consultationFee
        ? inv.consultationFee.toString()
        : null,
      slotDuration: inv.slotDuration,
      isActive: inv.isActive,
    }));
  }

  // Update doctor affiliation settings
  async updateDoctorAffiliation(
    userId: string,
    clinicDoctorId: string,
    data: UpdateDoctorAffiliationDto,
  ): Promise<{ message: string }> {
    const clinic = await profileRepository.findByOwnerId(userId);

    if (!clinic) {
      throw new NotFoundError("Clinic not found");
    }

    // Get the affiliation by clinicDoctorId
    const affiliation = await invitationRepository.getAffiliatedDoctors(
      clinic.id,
    );

    // Find the specific doctor affiliation
    const doctorAffiliation = affiliation.find(
      (aff) => aff.id === clinicDoctorId,
    );

    if (!doctorAffiliation) {
      throw new NotFoundError("Doctor affiliation not found for this clinic");
    }

    await invitationRepository.updateAffiliation(clinicDoctorId, data);

    logger.info(
      `Clinic ${clinic.id} updated affiliation settings for ${clinicDoctorId}`,
    );

    return {
      message: "Doctor affiliation updated successfully",
    };
  }

  // Cancel pending invitation
  async cancelInvitation(
    userId: string,
    clinicDoctorId: string,
  ): Promise<{ message: string }> {
    const clinic = await profileRepository.findByOwnerId(userId);

    if (!clinic) {
      throw new NotFoundError("Clinic not found");
    }

    await invitationRepository.cancelInvitation(clinicDoctorId);

    logger.info(`Clinic ${clinic.id} cancelled invitation ${clinicDoctorId}`);

    return {
      message: "Invitation cancelled successfully",
    };
  }

  // Remove doctor from clinic
  async removeDoctorFromClinic(
    userId: string,
    clinicDoctorId: string,
  ): Promise<{ message: string }> {
    const clinic = await profileRepository.findByOwnerId(userId);

    if (!clinic) {
      throw new NotFoundError("Clinic not found");
    }

    await invitationRepository.removeDoctorFromClinic(clinicDoctorId);

    // Decrement used slots
    await invitationRepository.updateUsedSlots(clinic.id, false);

    logger.info(
      `Clinic ${clinic.id} removed doctor affiliation ${clinicDoctorId}`,
    );

    return {
      message: "Doctor removed from clinic successfully",
    };
  }

  // Helper: Transform to DoctorInvitationResponse
  private toDoctorInvitationResponse(
    invitation: any,
  ): DoctorInvitationResponse {
    return {
      id: invitation.id,
      clinicId: invitation.clinicId,
      clinicName: invitation.clinic.name,
      doctorId: invitation.doctor.doctorId,
      doctorName: `${invitation.doctor.firstName} ${invitation.doctor.lastName}`,
      doctorEmail: invitation.doctor.user.email,
      status: invitation.status,
      invitedAt: invitation.invitedAt,
      respondedAt: invitation.respondedAt,
      expiresAt: invitation.expiresAt,
      consultationFee: invitation.consultationFee
        ? invitation.consultationFee.toString()
        : null,
      slotDuration: invitation.slotDuration,
      isActive: invitation.isActive,
    };
  }

  // Helper: Transform to AffiliatedDoctorResponse
  private toAffiliatedDoctorResponse(
    affiliation: any,
  ): AffiliatedDoctorResponse {
    return {
      id: affiliation.id,
      doctorId: affiliation.doctor.doctorId,
      doctorName: `${affiliation.doctor.firstName} ${affiliation.doctor.lastName}`,
      doctorEmail: affiliation.doctor.user.email,
      specialization: affiliation.doctor.specialization,
      status: affiliation.status,
      consultationFee: affiliation.consultationFee
        ? affiliation.consultationFee.toString()
        : null,
      slotDuration: affiliation.slotDuration,
      schedule: affiliation.schedule,
      isActive: affiliation.isActive,
      addedAt: affiliation.addedAt,
    };
  }
}

export default new InvitationService();
