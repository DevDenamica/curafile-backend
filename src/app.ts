import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import "express-async-errors";
import { env } from "@config/env";
import logger from "@shared/utils/logger";
import errorHandler from "@shared/middlewares/errorHandler";
import notFoundHandler from "@shared/middlewares/notFound";

// Routes
import healthRoutes from "@modules/health/health.routes";
import patientRoutes from "@modules/patients";
import doctorRoutes from "@modules/doctors";

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS
    this.app.use(
      cors({
        origin: true,
        credentials: true,
      })
    );

    // Body parsing middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging
    this.app.use((req, _res, next) => {
      logger.http(`${req.method} ${req.path}`);
      next();
    });
  }

  private initializeRoutes(): void {
    this.app.get("/", (_req, res) => {
      res.status(200).json({
        name: "Curafile Backend",
        status: "Running",
        version: "1.0.0",
      });
    });

    // Health check
    this.app.use("/api/health", healthRoutes);

    // Patient routes
    this.app.use("/api/patients", patientRoutes);

    // Doctor routes
    this.app.use("/api/doctors", doctorRoutes);
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }
}

export default new App().app;
