import { Request, Response } from "express";
import familyService from "./family.service";
import {
  addFamilyMemberSchema,
  updateFamilyMemberPermissionsSchema,
} from "./family.dto";

export class FamilyController {
  async addFamilyMember(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const data = addFamilyMemberSchema.parse(req.body);
    const result = await familyService.addFamilyMember(userId, data);
    res.status(201).json(result);
  }

  async getFamilyMembers(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const result = await familyService.getFamilyMembers(userId);
    res.status(200).json(result);
  }

  async updateFamilyMemberPermissions(
    req: Request,
    res: Response,
  ): Promise<void> {
    const userId = req.user!.id;
    const relationId = req.params.relationId as string;
    const data = updateFamilyMemberPermissionsSchema.parse(req.body);
    const result = await familyService.updateFamilyMemberPermissions(
      userId,
      relationId,
      data,
    );
    res.status(200).json(result);
  }

  async removeFamilyMember(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const relationId = req.params.relationId as string;
    const result = await familyService.removeFamilyMember(userId, relationId);
    res.status(200).json(result);
  }
}

export default new FamilyController();
