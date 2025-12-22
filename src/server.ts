import app from "./app";
import { env } from "@config/env";
import { connectDatabase, disconnectDatabase } from "@config/database";
import logger from "@shared/utils/logger";

const PORT = parseInt(env.APP_PORT, 10);

const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`
      ╔════════════════════════════════════════════╗
      ║                                            ║
      ║   🚀 ${env.APP_NAME.toUpperCase()} v${env.APP_VERSION}      ║
      ║                                            ║
      ║   Environment: ${env.NODE_ENV.padEnd(27)} ║
      ║   Port: ${PORT.toString().padEnd(34)} ║
      ║   Health: http://localhost:${PORT}/api/health ║
      ║                                            ║
      ╚════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info("HTTP server closed");

        await disconnectDatabase();

        logger.info("Graceful shutdown completed");
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error("Forcing shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // Handle uncaught errors
    process.on("uncaughtException", (error: Error) => {
      logger.error("Uncaught Exception:", error);
      gracefulShutdown("uncaughtException");
    });

    process.on("unhandledRejection", (reason: any) => {
      logger.error("Unhandled Rejection:", reason);
      gracefulShutdown("unhandledRejection");
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
