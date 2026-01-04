import bcrypt from "bcrypt";
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
  /**
   * Change password (different from reset password - requires current password)
   */
  async changePassword(
    patientId: string,
    data: ChangePasswordDto
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword } = data;

    // Get patient
    const patient = await patientRepository.findById(patientId);
    if (!patient) {
      throw new NotFoundError("Patient not found");
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      patient.password
    );
    if (!isPasswordValid) {
      throw new BadRequestError("Current password is incorrect");
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, patient.password);
    if (isSamePassword) {
      throw new BadRequestError(
        "New password cannot be the same as your current password"
      );
    }

    // Validate new password strength
    const passwordValidation = PasswordValidator.validate(newPassword);
    if (!passwordValidation.isValid) {
      throw new BadRequestError(passwordValidation.errors.join(", "));
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await patientRepository.updatePassword(patient.id, hashedPassword);

    // Invalidate all existing tokens for security
    await logoutService.invalidateAllTokensForPatient(
      patient.id,
      "PASSWORD_CHANGED"
    );

    return {
      message:
        "Password changed successfully. All devices have been logged out for security.",
    };
  }

  // Forgot Password - Request password reset via link
  async forgotPassword(data: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = data;

    // Check if patient exists
    const patient = await patientRepository.findByEmail(email);
    if (!patient) {
      // Don't reveal if email exists or not (security)
      return {
        message: `If an account exists with ${email}, you will receive a password reset link shortly`,
      };
    }

    // Check if account is active
    if (!patient.isActive) {
      throw new BadRequestError("Account is inactive, please contact support");
    }

    // Generate reset token and send email with link
    const resetToken = await passwordResetService.createResetToken(email);
    await emailService.sendPasswordResetLink(email, resetToken);

    return {
      message: `If an account exists with ${email}, you will receive a password reset link shortly`,
    };
  }

  // Verify reset token (optional - for frontend to check if token is valid)
  async verifyResetToken(
    token: string
  ): Promise<{ valid: boolean; email?: string }> {
    return await passwordResetService.verifyResetToken(token);
  }

  // Reset Password with token
  async resetPassword(data: ResetPasswordDto): Promise<{ message: string }> {
    const { token, newPassword } = data;

    // Verify reset token
    const tokenVerification = await passwordResetService.verifyResetToken(
      token
    );
    if (!tokenVerification.valid || !tokenVerification.email) {
      throw new BadRequestError(
        "Invalid or expired reset link. Please request a new password reset"
      );
    }

    const email = tokenVerification.email;

    // Find patient
    const patient = await patientRepository.findByEmail(email);
    if (!patient) {
      throw new NotFoundError("Patient not found");
    }

    // Validate new password
    const passwordValidation = PasswordValidator.validate(newPassword);
    if (!passwordValidation.isValid) {
      throw new BadRequestError(passwordValidation.errors.join(", "));
    }

    // Check if new password is same as old password
    const isSamePassword = await bcrypt.compare(newPassword, patient.password);
    if (isSamePassword) {
      throw new BadRequestError(
        "New password cannot be the same as your current password"
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await patientRepository.updatePassword(patient.id, hashedPassword);

    // Mark token as used
    await passwordResetService.markTokenAsUsed(token);

    // Invalidate all tokens after password reset
    await logoutService.invalidateAllTokensForPatient(
      patient.id,
      "PASSWORD_CHANGED"
    );

    return {
      message:
        "Password reset successfully. You can now login with your new password",
    };
  }
}

export default new PasswordService();
