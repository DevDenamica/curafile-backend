import { Request, Response, NextFunction } from 'express';
import { AppError } from '@shared/exceptions/AppError';
import { ZodError } from 'zod';
import logger from '@shared/utils/logger';
import { env } from '@config/env';

interface ErrorResponse {
  status: 'error';
  statusCode: number;
  message: string;
  stack?: string;
  errors?: any;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: any = undefined;

  // Handle AppError (custom errors)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Handle Zod validation errors
  else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation error';
    errors = err.errors.map((error) => ({
      field: error.path.join('.'),
      message: error.message,
    }));
  }

  // Handle Prisma errors (check by error name)
  else if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    statusCode = 400;

    switch (prismaError.code) {
      case 'P2002':
        message = `Duplicate field value: ${prismaError.meta?.target}`;
        break;
      case 'P2014':
        message = `Invalid ID: ${prismaError.meta?.target}`;
        break;
      case 'P2003':
        message = `Invalid input data: ${prismaError.meta?.target}`;
        break;
      case 'P2025':
        message = 'Record not found';
        statusCode = 404;
        break;
      default:
        message = 'Database error occurred';
    }
  }

  // Handle Prisma validation errors
  else if (err.constructor.name === 'PrismaClientValidationError') {
    statusCode = 400;
    message = 'Invalid data provided';
  }

  // Log error
  logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${statusCode}, Message:: ${message}`);
  if (env.NODE_ENV === 'development') {
    logger.error(err.stack);
  }

  // Prepare response
  const response: ErrorResponse = {
    status: 'error',
    statusCode,
    message,
  };

  // Add stack trace in development
  if (env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  // Add validation errors if present
  if (errors) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
