import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "@config/env";
import { UnauthorizedError } from "@shared/exceptions/AppError";
import prisma from "@config/database";

export interface JwtPayload {
  id: string;
  patientId: string;
  email: string;
  role: string;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticatePatient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // Check if user is a patient
    if (decoded.role !== "PATIENT") {
      throw new UnauthorizedError("Access denied. Patient role required.");
    }

    // Check current patient status in database
    const patient = await prisma.patient.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        termsAccepted: true,
        isActive: true,
      },
    });

    // Check if patient exists
    if (!patient) {
      throw new UnauthorizedError("Patient not found");
    }

    // Check if patient has accepted terms
    if (!patient.termsAccepted) {
      throw new UnauthorizedError(
        "Please accept the terms and conditions to access this resource"
      );
    }

    // Check if patient account is active
    if (!patient.isActive) {
      throw new UnauthorizedError(
        "Account is inactive. Please contact support."
      );
    }

    // Attach user to request
    req.user = decoded;

    next();
  } catch (error) {
    // Pass through UnauthorizedError we threw manually
    if (error instanceof UnauthorizedError) {
      next(error);
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError("Invalid token"));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError("Token expired"));
    } else {
      next(error);
    }
  }
};
