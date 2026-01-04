import { z } from "zod";

// Change password
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;

// Forgot Password
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;

// Verify Reset Token (optional - for frontend to check if token is valid)
export const verifyResetTokenSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
});

export type VerifyResetTokenDto = z.infer<typeof verifyResetTokenSchema>;

// Reset Password with Token
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
