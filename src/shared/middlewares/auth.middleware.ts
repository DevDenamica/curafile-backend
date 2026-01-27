import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "@config/env";
import { UnauthorizedError } from "@shared/exceptions/AppError";
import prisma from "@config/database";
import logoutService from "@modules/patients/auth/logout.service";

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
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
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    const isBlacklisted = await logoutService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new UnauthorizedError(
        "Token has been invalidated. Please login again.",
      );
    }

    if (decoded.role !== "PATIENT") {
      throw new UnauthorizedError("Access denied. Patient role required.");
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        isActive: true,
        isDeleted: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    if (!user.isActive || user.isDeleted) {
      throw new UnauthorizedError(
        "Account is inactive. Please contact support.",
      );
    }

    req.user = decoded;

    next();
  } catch (error) {
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

export const authenticateDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    const isBlacklisted = await logoutService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new UnauthorizedError(
        "Token has been invalidated. Please login again.",
      );
    }

    if (decoded.role !== "DOCTOR") {
      throw new UnauthorizedError("Access denied. Doctor role required.");
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        isActive: true,
        isDeleted: true,
        doctorProfile: {
          select: {
            id: true,
            isVerified: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    if (!user.isActive || user.isDeleted) {
      throw new UnauthorizedError(
        "Account is inactive. Please contact support.",
      );
    }

    req.user = decoded;

    next();
  } catch (error) {
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

export const authenticateClinic = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    const isBlacklisted = await logoutService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new UnauthorizedError(
        "Token has been invalidated. Please login again.",
      );
    }

    if (decoded.role !== "CLINIC_STAFF") {
      throw new UnauthorizedError("Access denied. Clinic staff role required.");
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        isActive: true,
        isDeleted: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    if (!user.isActive || user.isDeleted) {
      throw new UnauthorizedError(
        "Account is inactive. Please contact support.",
      );
    }

    req.user = decoded;

    next();
  } catch (error) {
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
