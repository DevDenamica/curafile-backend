import { Router } from "express";
import medicalRecordsController from "./medical-records.controller";
import { authenticatePatient } from "@shared/middlewares/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticatePatient);

// Vaccination Records
router.post("/vaccinations", medicalRecordsController.createVaccinationRecord.bind(medicalRecordsController));
router.get("/vaccinations", medicalRecordsController.getVaccinationRecords.bind(medicalRecordsController));
router.put("/vaccinations/:recordId", medicalRecordsController.updateVaccinationRecord.bind(medicalRecordsController));
router.delete("/vaccinations/:recordId", medicalRecordsController.deleteVaccinationRecord.bind(medicalRecordsController));

// Medical Documents
router.post("/documents", medicalRecordsController.uploadMedicalDocument.bind(medicalRecordsController));
router.get("/documents", medicalRecordsController.getMedicalDocuments.bind(medicalRecordsController));

// Family Members
router.post("/family", medicalRecordsController.addFamilyMember.bind(medicalRecordsController));
router.get("/family", medicalRecordsController.getFamilyMembers.bind(medicalRecordsController));
router.patch("/family/:relationId", medicalRecordsController.updateFamilyMemberPermissions.bind(medicalRecordsController));
router.delete("/family/:relationId", medicalRecordsController.removeFamilyMember.bind(medicalRecordsController));

// Sharing Permissions
router.post("/sharing", medicalRecordsController.createSharingPermission.bind(medicalRecordsController));
router.get("/sharing", medicalRecordsController.getSharingPermissions.bind(medicalRecordsController));
router.delete("/sharing/:permissionId", medicalRecordsController.revokeSharingPermission.bind(medicalRecordsController));

export default router;
