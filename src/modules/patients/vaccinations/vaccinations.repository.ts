import prisma from "@config/database";
import {
  CreateVaccinationRecordDto,
  UpdateVaccinationRecordDto,
} from "./vaccinations.dto";

export class VaccinationsRepository {
  async createVaccinationRecord(
    patientId: string,
    data: CreateVaccinationRecordDto,
    administeredBy?: string,
  ) {
    return prisma.vaccinationRecord.create({
      data: {
        patientId,
        ...data,
        administeredBy,
      },
    });
  }

  async getVaccinationRecords(patientId: string) {
    return prisma.vaccinationRecord.findMany({
      where: {
        patientId,
      },
      orderBy: {
        administeredDate: "desc",
      },
    });
  }

  async getVaccinationRecordById(patientId: string, recordId: string) {
    return prisma.vaccinationRecord.findFirst({
      where: {
        id: recordId,
        patientId,
      },
    });
  }

  async updateVaccinationRecord(
    patientId: string,
    recordId: string,
    data: UpdateVaccinationRecordDto,
  ) {
    return prisma.vaccinationRecord.updateMany({
      where: {
        id: recordId,
        patientId,
      },
      data,
    });
  }

  async deleteVaccinationRecord(patientId: string, recordId: string) {
    return prisma.vaccinationRecord.deleteMany({
      where: {
        id: recordId,
        patientId,
      },
    });
  }
}

export default new VaccinationsRepository();
