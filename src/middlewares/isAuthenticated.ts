import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies.Authorization || req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, message: 'UnAuthorized. Please log in to continue.' });
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

    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};
