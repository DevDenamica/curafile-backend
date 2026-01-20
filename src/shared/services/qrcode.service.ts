import QRCode from "qrcode";
import logger from "@shared/utils/logger";

export class QRCodeService {
  /**
   * Generate QR code as base64 data URL
   * This can be stored directly or used to display the QR code
   */
  async generateDataUrl(patientId: string): Promise<string> {
    try {
      const dataUrl = await QRCode.toDataURL(patientId, {
        errorCorrectionLevel: "M",
        type: "image/png",
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      logger.info(`QR code generated for patient ${patientId}`);
      return dataUrl;
    } catch (error: any) {
      logger.error(`Error generating QR code for ${patientId}:`, error.message);
      throw new Error("Failed to generate QR code");
    }
  }

  /**
   * Generate QR code as Buffer (for file storage)
   */
  async generateBuffer(patientId: string): Promise<Buffer> {
    try {
      const buffer = await QRCode.toBuffer(patientId, {
        errorCorrectionLevel: "M",
        type: "png",
        width: 300,
        margin: 2,
      });

      return buffer;
    } catch (error: any) {
      logger.error(`Error generating QR code buffer for ${patientId}:`, error.message);
      throw new Error("Failed to generate QR code");
    }
  }
}

export default new QRCodeService();
