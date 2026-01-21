import bcrypt from "bcryptjs";
import patientRepository from "../shared/patient.repository";
import emailService from "@shared/services/email.service";
import passwordResetService from "@shared/services/passwordReset.service";
import logoutService from "../auth/logout.service";
import { PasswordValidator } from "@shared/utils/passwordValidator";
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from "./password.dto";
import {
  BadRequestError,
  NotFoundError,
} from "@shared/exceptions/AppError";

export class PasswordService {
  async changePassword(
    userId: string,
    data: ChangePasswordDto
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword } = data;

    const user = await patientRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );
    if (!isPasswordValid) {
      throw new BadRequestError("Current password is incorrect");
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSamePassword) {
      throw new BadRequestError(
        "New password cannot be the same as your current password"
      );
    }

    const passwordValidation = PasswordValidator.validate(newPassword);
    if (!passwordValidation.isValid) {
      throw new BadRequestError(passwordValidation.errors.join(", "));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await patientRepository.updatePassword(user.id, hashedPassword);

    await logoutService.invalidateAllTokensForUser(user.id, "PASSWORD_CHANGED");

    return {
      message:
        "Password changed successfully. All devices have been logged out for security.",
    };
  }

  async forgotPassword(data: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = data;

    const user = await patientRepository.findByEmail(email);
    if (!user) {
      return {
        message: `If an account exists with ${email}, you will receive a password reset link shortly`,
      };
    }

    if (!user.isActive || user.isDeleted) {
      throw new BadRequestError("Account is inactive, please contact support");
    }

    const resetToken = await passwordResetService.createResetToken(email);
    await emailService.sendPasswordResetLink(email, resetToken);

    return {
      message: `If an account exists with ${email}, you will receive a password reset link shortly`,
    };
  }

  async verifyResetToken(
    token: string
  ): Promise<{ valid: boolean; email?: string }> {
    return await passwordResetService.verifyResetToken(token);
  }

  async resetPassword(data: ResetPasswordDto): Promise<{ message: string }> {
    const { token, newPassword } = data;

    const tokenVerification = await passwordResetService.verifyResetToken(
      token
    );
    if (!tokenVerification.valid || !tokenVerification.email) {
      throw new BadRequestError(
        "Invalid or expired reset link. Please request a new password reset"
      );
    }

    const email = tokenVerification.email;

    const user = await patientRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const passwordValidation = PasswordValidator.validate(newPassword);
    if (!passwordValidation.isValid) {
      throw new BadRequestError(passwordValidation.errors.join(", "));
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSamePassword) {
      throw new BadRequestError(
        "New password cannot be the same as your current password"
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await patientRepository.updatePassword(user.id, hashedPassword);

    await passwordResetService.markTokenAsUsed(token);

    await logoutService.invalidateAllTokensForUser(user.id, "PASSWORD_CHANGED");

    return {
      message:
        "Password reset successfully. You can now login with your new password",
    };
  }
}

export default new PasswordService();
