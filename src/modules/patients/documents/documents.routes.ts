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
router.patch(
  "/:documentId",
  documentsController.updateMedicalDocument.bind(documentsController),
);
router.delete(
  "/:documentId",
  documentsController.deleteMedicalDocument.bind(documentsController),
);

export default router;
