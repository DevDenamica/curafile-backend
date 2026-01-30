import invitationRepository from "./invitation.repository";
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "@shared/exceptions/AppError";
import logger from "@shared/utils/logger";
import { ClinicInvitationResponse, MyClinicResponse } from "./invitation.dto";
import { ClinicDoctorStatus } from "@prisma/client";

export class DoctorInvitationService {
  // Get pending invitations
  async getPendingInvitations(
    userId: string,
  ): Promise<ClinicInvitationResponse[]> {
    const doctor = await invitationRepository.findDoctorByUserId(userId);

    if (!doctor) {
      throw new NotFoundError("Doctor profile not found");
    }

    const invitations = await invitationRepository.getPendingInvitations(
      doctor.id,
    );

    return invitations.map((inv) => ({
      id: inv.id,
      clinicId: inv.clinicId,
      clinicName: inv.clinic.name,
      clinicEmail: inv.clinic.email,
      clinicAddress: inv.clinic.address,
      clinicCity: inv.clinic.city,
      clinicCountry: inv.clinic.country,
      status: inv.status,
      invitedAt: inv.invitedAt,
      expiresAt: inv.expiresAt,
      consultationFee: inv.consultationFee
        ? inv.consultationFee.toString()
        : null,
      slotDuration: inv.slotDuration,
    }));
  }

  // Accept invitation
  async acceptInvitation(
    userId: string,
    clinicDoctorId: string,
  ): Promise<{ message: string }> {
    const doctor = await invitationRepository.findDoctorByUserId(userId);

    if (!doctor) {
      throw new NotFoundError("Doctor profile not found");
    }

    const invitation =
      await invitationRepository.getInvitationById(clinicDoctorId);

    if (!invitation) {
      throw new NotFoundError("Invitation not found");
    }

    // Verify invitation belongs to this doctor
    if (invitation.doctorId !== doctor.id) {
      throw new ForbiddenError("This invitation is not for you");
    }

    // Check if already responded
    if (invitation.status !== ClinicDoctorStatus.PENDING) {
      throw new BadRequestError(
        `Invitation already ${invitation.status.toLowerCase()}`,
      );
    }

    // Check if expired
    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      throw new BadRequestError("Invitation has expired");
    }

    // Check subscription slots
    if (invitation.clinic.subscription) {
      const { doctorSlots, usedSlots } = invitation.clinic.subscription;
      if (usedSlots >= doctorSlots) {
        throw new ForbiddenError(
          "Clinic has reached maximum doctor capacity. Please contact the clinic.",
        );
      }
    }

    // Accept invitation
    await invitationRepository.acceptInvitation(clinicDoctorId);

    // Increment clinic's used slots
    await invitationRepository.incrementUsedSlots(invitation.clinicId);

    logger.info(
      `Doctor ${doctor.doctorId} accepted invitation from clinic ${invitation.clinic.name}`,
    );

    return {
      message:
        "Invitation accepted successfully. You are now affiliated with the clinic.",
    };
  }

  // Reject invitation
  async rejectInvitation(
    userId: string,
    clinicDoctorId: string,
  ): Promise<{ message: string }> {
    const doctor = await invitationRepository.findDoctorByUserId(userId);

    if (!doctor) {
      throw new NotFoundError("Doctor profile not found");
    }

    const invitation =
      await invitationRepository.getInvitationById(clinicDoctorId);

    if (!invitation) {
      throw new NotFoundError("Invitation not found");
    }

    // Verify invitation belongs to this doctor
    if (invitation.doctorId !== doctor.id) {
      throw new ForbiddenError("This invitation is not for you");
    }

    // Check if already responded
    if (invitation.status !== ClinicDoctorStatus.PENDING) {
      throw new BadRequestError(
        `Invitation already ${invitation.status.toLowerCase()}`,
      );
    }

    // Reject invitation
    await invitationRepository.rejectInvitation(clinicDoctorId);

    logger.info(
      `Doctor ${doctor.doctorId} rejected invitation from clinic ${invitation.clinic.name}`,
    );

    return {
      message: "Invitation rejected",
    };
  }

  // Get my clinics
  async getMyClinics(userId: string): Promise<MyClinicResponse[]> {
    const doctor = await invitationRepository.findDoctorByUserId(userId);

    if (!doctor) {
      throw new NotFoundError("Doctor profile not found");
    }

    const affiliations = await invitationRepository.getMyClinics(doctor.id);

    return affiliations.map((aff) => ({
      id: aff.id,
      clinicId: aff.clinicId,
      clinicName: aff.clinic.name,
      clinicEmail: aff.clinic.email,
      clinicAddress: aff.clinic.address,
      clinicCity: aff.clinic.city,
      clinicCountry: aff.clinic.country,
      consultationFee: aff.consultationFee
        ? aff.consultationFee.toString()
        : null,
      slotDuration: aff.slotDuration,
      schedule: aff.schedule,
      isActive: aff.isActive,
      addedAt: aff.addedAt,
    }));
  }

  // Leave clinic
  async leaveClinic(
    userId: string,
    clinicDoctorId: string,
  ): Promise<{ message: string }> {
    const doctor = await invitationRepository.findDoctorByUserId(userId);

    if (!doctor) {
      throw new NotFoundError("Doctor profile not found");
    }

    const affiliation =
      await invitationRepository.getInvitationById(clinicDoctorId);

    if (!affiliation) {
      throw new NotFoundError("Clinic affiliation not found");
    }

    // Verify affiliation belongs to this doctor
    if (affiliation.doctorId !== doctor.id) {
      throw new ForbiddenError("This affiliation is not yours");
    }

    // Leave clinic
    await invitationRepository.leaveClinic(clinicDoctorId);

    // Decrement clinic's used slots
    await invitationRepository.decrementUsedSlots(affiliation.clinicId);

    logger.info(
      `Doctor ${doctor.doctorId} left clinic ${affiliation.clinic.name}`,
    );

    return {
      message: "Left clinic successfully",
    };
  }
}

export default new DoctorInvitationService();
