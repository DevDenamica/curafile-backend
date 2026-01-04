import bcrypt from "bcrypt";
import patientRepository from "../shared/patient.repository";
import logoutService from "../auth/logout.service";
import {
  UnauthorizedError,
  NotFoundError,
} from "@shared/exceptions/AppError";

export class AccountService {
  /**
   * Deactivate account (soft delete)
   */
  async deactivateAccount(
    patientId: string,
    password: string
  ): Promise<{ message: string }> {
    // Get patient
    const patient = await patientRepository.findById(patientId);
    if (!patient) {
      throw new NotFoundError("Patient not found");
    }

    // Verify password before deactivation
    const isPasswordValid = await bcrypt.compare(password, patient.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError(
        "Incorrect password. Cannot deactivate account."
      );
    }

    // Soft delete
    await patientRepository.softDelete(patientId);

    // Invalidate all tokens when account is deactivated
    await logoutService.invalidateAllTokensForPatient(
      patientId,
      "ACCOUNT_DEACTIVATED"
    );

    return {
      message:
        "Account deactivated successfully. You can reactivate by logging in again.",
    };
  }
}

export default new AccountService();
