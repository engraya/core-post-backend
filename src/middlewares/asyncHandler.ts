import { RequestHandler } from 'express';

type AsyncRequestHandler = (
  req: Parameters<RequestHandler>[0],
  res: Parameters<RequestHandler>[1],
  next: Parameters<RequestHandler>[2],
) => Promise<void>;

/**
 * Adapts an async Express handler so rejections are forwarded to `next` instead of leaving the request hanging.
 */
export function asyncHandler(fn: AsyncRequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
