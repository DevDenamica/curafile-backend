import nodemailer, { Transporter } from "nodemailer";
import { Resend } from "resend";
import { env } from "@config/env";
import logger from "@shared/utils/logger";

export class EmailService {
  private transporter: Transporter | null = null;
  private resend: Resend | null = null;
  private provider: "smtp" | "resend";

  constructor() {
    this.provider = env.EMAIL_PROVIDER;

    if (this.provider === "resend") {
      if (!env.RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY is required when EMAIL_PROVIDER is resend");
      }
      this.resend = new Resend(env.RESEND_API_KEY);
      logger.info("Email service initialized with Resend API");
    } else {
      this.transporter = nodemailer.createTransport({
        host: env.EMAIL_HOST,
        port: parseInt(env.EMAIL_PORT),
        secure: false,
        auth: {
          user: env.EMAIL_USER,
          pass: env.EMAIL_PASSWORD,
        },
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000,
      });
      logger.info("Email service initialized with SMTP");
    }
  }

  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    if (this.provider === "resend" && this.resend) {
      const { error } = await this.resend.emails.send({
        from: env.EMAIL_FROM,
        to,
        subject,
        html,
      });

      if (error) {
        throw new Error(`Resend error: ${error.message}`);
      }
    } else if (this.transporter) {
      await this.transporter.sendMail({
        from: env.EMAIL_FROM,
        to,
        subject,
        html,
      });
    } else {
      throw new Error("No email provider configured");
    }
  }

  async sendOTP(email: string, otp: string): Promise<void> {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .otp-code { font-size: 32px; font-weight: bold; color: #4CAF50; letter-spacing: 5px; text-align: center; padding: 20px; background-color: #fff; border: 2px dashed #4CAF50; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Email Verification</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Thank you for registering with Curafile! To complete your registration, please use the following One-Time Password (OTP):</p>
              <div class="otp-code">${otp}</div>
              <p>This code will expire in ${env.OTP_EXPIRY_MINUTES} minutes.</p>
              <p>If you didn't request this code, please ignore this email.</p>
              <p>Best regards,<br>The Curafile Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.sendEmail(email, "Verify Your Email - Curafile", html);
      logger.info(`OTP email sent to ${email}`);
    } catch (error: any) {
      logger.error(`Error sending OTP email to ${email}:`, error.message);
      throw new Error("Failed to send verification email");
    }
  }

  async sendWelcomeEmail(
    email: string,
    fullName: string,
    patientId: string
  ): Promise<void> {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .patient-id { font-size: 20px; font-weight: bold; color: #4CAF50; text-align: center; padding: 15px; background-color: #fff; border: 2px solid #4CAF50; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Curafile!</h1>
            </div>
            <div class="content">
              <p>Dear ${fullName},</p>
              <p>Congratulations! Your registration has been completed successfully.</p>
              <p>Your unique Patient ID is:</p>
              <div class="patient-id">${patientId}</div>
              <p>Please keep this ID safe as you will need it for future reference.</p>
              <p>You can now log in to your account and start using our services.</p>
              <p>Thank you for choosing Curafile!</p>
              <p>Best regards,<br>The Curafile Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.sendEmail(email, "Welcome to Curafile!", html);
      logger.info(`Welcome email sent to ${email}`);
    } catch (error: any) {
      logger.error(`Error sending welcome email to ${email}:`, error.message);
    }
  }

  async sendPasswordResetLink(email: string, resetToken: string): Promise<void> {
    try {
      const frontendUrl = env.FRONTEND_URL || "http://localhost:3001";
      const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #FF6B6B; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 15px 30px; background-color: #FF6B6B; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .link-box { background-color: #fff; border: 1px solid #ddd; padding: 15px; margin: 20px 0; word-break: break-all; }
            .warning { background-color: #FFF3CD; border-left: 4px solid #FFC107; padding: 12px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>We received a request to reset your password for your Curafile account. Click the button below to reset your password:</p>
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Your Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <div class="link-box">${resetLink}</div>
              <p>This link will expire in ${env.OTP_EXPIRY_MINUTES} minutes for security reasons.</p>
              <div class="warning">
                <strong>Warning:</strong> If you didn't request this password reset, please ignore this email.
              </div>
              <p>Best regards,<br>The Curafile Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.sendEmail(email, "Reset Your Password - Curafile", html);
      logger.info(`Password reset link email sent to ${email}`);
    } catch (error: any) {
      logger.error(`Error sending password reset email to ${email}:`, error.message);
      throw new Error("Failed to send password reset email");
    }
  }
}

export default new EmailService();
