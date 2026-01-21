import { Request, Response } from "express";
import sharingService from "./sharing.service";
import { createSharingPermissionSchema } from "./sharing.dto";

export class SharingController {
  async createSharingPermission(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const data = createSharingPermissionSchema.parse(req.body);
    const result = await sharingService.createSharingPermission(userId, data);
    res.status(201).json(result);
  }

  async getSharingPermissions(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const result = await sharingService.getSharingPermissions(userId);
    res.status(200).json(result);
  }

  async revokeSharingPermission(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const permissionId = req.params.permissionId as string;
    const result = await sharingService.revokeSharingPermission(
      userId,
      permissionId,
    );
    res.status(200).json(result);
  }
}

export default new SharingController();
