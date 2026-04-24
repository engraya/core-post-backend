import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

/** Sets `req.user` when a valid JWT is present; otherwise continues without error. */
export const optionalAuthenticated = (req: Request, _res: Response, next: NextFunction): void => {
  const token = req.cookies.Authorization || req.headers.authorization?.split(' ')[1];

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as {
      userId: string;
      email: string;
      verified: boolean;
    };

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      verified: decoded.verified,
    };
  } catch {
    // Ignore invalid or expired token for optional auth
  }

  next();
};
