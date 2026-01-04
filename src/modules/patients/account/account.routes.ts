import { Router } from "express";
import accountController from "./account.controller";
import { authenticatePatient } from "@shared/middlewares/auth.middleware";

const router = Router();

// Protected account routes
router.post(
  "/deactivate",
  authenticatePatient,
  accountController.deactivateAccount.bind(accountController)
);

export default router;
