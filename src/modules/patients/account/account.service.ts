import bcrypt from "bcryptjs";
import patientRepository from "../shared/patient.repository";
import logoutService from "../auth/logout.service";
import {
  UnauthorizedError,
  NotFoundError,
} from "@shared/exceptions/AppError";

export class AccountService {
  async deactivateAccount(
    userId: string,
    password: string
  ): Promise<{ message: string }> {
    const user = await patientRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError(
        "Incorrect password. Cannot deactivate account."
      );
    }

    await patientRepository.softDelete(userId);

    await logoutService.invalidateAllTokensForUser(
      userId,
      "ACCOUNT_DEACTIVATED"
    );

    return {
      message:
        "Account deactivated successfully. You can reactivate by logging in again.",
    };
  }
}

export default new AccountService();
