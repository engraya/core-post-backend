import express from 'express';
import * as authController from '../controllers/authController';
import { isAuthenticated } from '../middlewares/isAuthenticated';
import { authLoginRegisterLimiter, passwordFlowLimiter } from '../middlewares/rateLimiters';

const router = express.Router();

router.post('/register', authLoginRegisterLimiter, authController.register);
router.post('/login', authLoginRegisterLimiter, authController.login);
router.post('/logout', isAuthenticated, authController.logout);
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
router.patch('/change-password', isAuthenticated, authController.changePassword);
router.patch('/forgot-password', passwordFlowLimiter, authController.sendForgotPasswordCode);
router.patch(
  '/verify-forgot-password',
  passwordFlowLimiter,
  authController.verifyForgotPasswordCode,
);

export default router;
