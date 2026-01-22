import { Router } from "express";
import documentsController from "./documents.controller";
import { authenticatePatient } from "@shared/middlewares/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticatePatient);

router.post(
  "/",
  documentsController.uploadMedicalDocument.bind(documentsController),
);
router.get(
  "/",
  documentsController.getMedicalDocuments.bind(documentsController),
);
// Get shared patient's documents (requires permission)
router.get(
  "/shared/:patientId",
  documentsController.getSharedPatientDocuments.bind(documentsController),
);
router.patch(
  "/:documentId",
  documentsController.updateMedicalDocument.bind(documentsController),
);
router.delete(
  "/:documentId",
  documentsController.deleteMedicalDocument.bind(documentsController),
);

export default router;
