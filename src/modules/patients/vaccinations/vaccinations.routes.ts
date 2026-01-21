import { Router } from "express";
import vaccinationsController from "./vaccinations.controller";
import { authenticatePatient } from "@shared/middlewares/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticatePatient);

router.post(
  "/",
  vaccinationsController.createVaccinationRecord.bind(vaccinationsController),
);
router.get(
  "/",
  vaccinationsController.getVaccinationRecords.bind(vaccinationsController),
);
router.patch(
  "/:recordId",
  vaccinationsController.updateVaccinationRecord.bind(vaccinationsController),
);
router.delete(
  "/:recordId",
  vaccinationsController.deleteVaccinationRecord.bind(vaccinationsController),
);

export default router;