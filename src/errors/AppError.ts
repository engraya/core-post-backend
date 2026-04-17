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
