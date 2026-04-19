import { Request, Response, NextFunction } from 'express';
import User from '../models/userModel';

/** Requires a verified account (checks DB so status is current even if the JWT is stale). */
export const isVerified = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ success: false, message: 'UnAuthorized. Please log in to continue.' });
    return;
  }

  try {
    const user = await User.findById(userId).select('verified').lean();
    if (!user?.verified) {
      res.status(403).json({
        success: false,
        message: 'Please verify your email to access this resource.',
      });
      return;
    }
    if (req.user) {
      req.user.verified = true;
    }
    next();
  } catch {
    res.status(500).json({ success: false, message: 'Unable to verify account status.' });
  }
};
