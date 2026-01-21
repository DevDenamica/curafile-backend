import vaccinationsRepository from "./vaccinations.repository";
import patientRepository from "../shared/patient.repository";
import {
  CreateVaccinationRecordDto,
  UpdateVaccinationRecordDto,
  VaccinationRecordResponse,
} from "./vaccinations.dto";
import { NotFoundError } from "@/shared/exceptions/AppError";
import logger from "@shared/utils/logger";

export class VaccinationsService {
  async createVaccinationRecord(
    userId: string,
    data: CreateVaccinationRecordDto,
    administeredBy?: string,
  ): Promise<VaccinationRecordResponse> {
    try {
      const user = await patientRepository.findById(userId);
      if (!user || !user.patientProfile) {
        throw new NotFoundError("Patient profile not found");
      }

      const vaccinationRecord =
        await vaccinationsRepository.createVaccinationRecord(
          user.patientProfile.id,
          data,
          administeredBy,
        );

      logger.info(
        `Vaccination record created for patient ${user.patientProfile.qrCode}`,
      );
      return vaccinationRecord as VaccinationRecordResponse;
    } catch (error: any) {
      logger.error("Error creating vaccination record:", error.message);
      throw error;
    }
  }

  async getVaccinationRecords(
    userId: string,
  ): Promise<VaccinationRecordResponse[]> {
    try {
      const user = await patientRepository.findById(userId);
      if (!user || !user.patientProfile) {
        throw new NotFoundError("Patient profile not found");
      }

      const records = await vaccinationsRepository.getVaccinationRecords(
        user.patientProfile.id,
      );
      return records as VaccinationRecordResponse[];
    } catch (error: any) {
      logger.error("Error fetching vaccination records", error.message);
      throw error;
    }
  }

  async updateVaccinationRecord(
    userId: string,
    recordId: string,
    data: UpdateVaccinationRecordDto,
  ): Promise<{ message: string }> {
    try {
      const user = await patientRepository.findById(userId);
      if (!user || !user.patientProfile) {
        throw new NotFoundError("Patient profile not found");
      }

      const existingRecord =
        await vaccinationsRepository.getVaccinationRecordById(
          user.patientProfile.id,
          recordId,
        );
      if (!existingRecord) {
        throw new NotFoundError("Vaccination record not found");
      }

      await vaccinationsRepository.updateVaccinationRecord(
        user.patientProfile.id,
        recordId,
        data,
      );

      logger.info(`Vaccination record ${recordId} updated`);
      return { message: "Vaccination record updated successfully" };
    } catch (error: any) {
      logger.error("Error updating vaccination record:", error.message);
      throw error;
    }
  }

  async deleteVaccinationRecord(
    userId: string,
    recordId: string,
  ): Promise<{ message: string }> {
    try {
      const user = await patientRepository.findById(userId);
      if (!user || !user.patientProfile) {
        throw new NotFoundError("Patient profile not found");
      }

      const existingRecord =
        await vaccinationsRepository.getVaccinationRecordById(
          user.patientProfile.id,
          recordId,
        );
      if (!existingRecord) {
        throw new NotFoundError("Vaccination record not found");
      }

      await vaccinationsRepository.deleteVaccinationRecord(
        user.patientProfile.id,
        recordId,
      );
      logger.info(`Vaccination record ${recordId} deleted`);
      return { message: "Vaccination record deleted successfully" };
    } catch (error: any) {
      logger.error("Error deleting vaccination record:", error.message);
      throw error;
    }
  }
}

export default new VaccinationsService();
