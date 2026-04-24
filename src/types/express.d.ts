import { Request } from 'express';

/** Extends Express `Request` with `user` where JWT middleware has run. */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        verified: boolean;
      };
    }
  }
}
