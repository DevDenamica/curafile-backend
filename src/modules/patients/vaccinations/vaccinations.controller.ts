import { Request, Response } from "express";
import vaccinationsService from "./vaccinations.service";
import {
  createVaccinationRecordSchema,
  updateVaccinationRecordSchema,
} from "./vaccinations.dto";

export class VaccinationsController {
  async createVaccinationRecord(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const data = createVaccinationRecordSchema.parse(req.body);
    const result = await vaccinationsService.createVaccinationRecord(
      userId,
      data,
    );
    res.status(201).json(result);
  }

  async getVaccinationRecords(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const result = await vaccinationsService.getVaccinationRecords(userId);
    res.status(200).json(result);
  }

  async updateVaccinationRecord(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const recordId = req.params.recordId as string;
    const data = updateVaccinationRecordSchema.parse(req.body);
    const result = await vaccinationsService.updateVaccinationRecord(
      userId,
      recordId,
      data,
    );
    res.status(200).json(result);
  }

  async deleteVaccinationRecord(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const recordId = req.params.recordId as string;
    const result = await vaccinationsService.deleteVaccinationRecord(
      userId,
      recordId,
    );
    res.status(200).json(result);
  }
}

export default new VaccinationsController();
