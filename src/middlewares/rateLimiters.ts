import rateLimit from 'express-rate-limit';

/** Limits login/registration traffic (50 requests per 15 minutes per client). */
export const authLoginRegisterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Try again later.' },
});

/** Tighter cap for password reset and email verification flows. */
export const passwordFlowLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Try again later.' },
});
