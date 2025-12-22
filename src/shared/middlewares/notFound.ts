import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '@shared/exceptions/AppError';

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
};

export default notFoundHandler;
