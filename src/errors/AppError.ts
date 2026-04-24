/** Operational error: carries an HTTP status and message for the global error handler. */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public success = false,
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace?.(this, this.constructor);
  }
}
