import { ErrorRequestHandler } from 'express';
import { AppError } from '../errors/AppError';

/** Maps `AppError` to JSON responses; unexpected errors are logged and answered with 500. */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
