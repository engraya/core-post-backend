/**
 * Auth API: registration, session, email verification, and password reset flows
 * (rate-limited where brute-force is a concern).
 */
import express from 'express';
import * as authController from '../controllers/authController';
import { isAuthenticated } from '../middlewares/isAuthenticated';
import { authLoginRegisterLimiter, passwordFlowLimiter } from '../middlewares/rateLimiters';

const router = express.Router();

// Registration, login, and logout
router.post('/register', authLoginRegisterLimiter, authController.register);
router.post('/login', authLoginRegisterLimiter, authController.login);
router.post('/logout', isAuthenticated, authController.logout);
// Email verification (resend + confirm)
router.patch(
  '/send-verification-code',
  passwordFlowLimiter,
  authController.sendVerificationCode,
);
router.patch(
  '/verify-account',
  passwordFlowLimiter,
  authController.verifyVerificationCode,
);
// Authenticated password change
router.patch('/change-password', isAuthenticated, authController.changePassword);
// Forgot password: request code, then reset with code
router.patch('/forgot-password', passwordFlowLimiter, authController.sendForgotPasswordCode);
router.patch(
  '/verify-forgot-password',
  passwordFlowLimiter,
  authController.verifyForgotPasswordCode,
);

export default router;
