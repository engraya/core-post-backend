import { asyncHandler } from '../middlewares/asyncHandler';
import * as authService from '../services/authService';
import { config } from '../config/env';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  res.status(201).json({
    success: true,
    message: 'User Account created Successfully....!',
    data: result,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { token, user } = await authService.loginUser(req.body);
  res.cookie('Authorization', token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
    maxAge: 3600000,
    path: '/',
  });
  res.status(200).json({
    success: true,
    message: 'Login successful!',
    data: { token, user },
  });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie('Authorization', { path: '/' });
  res.status(200).json({ success: true, message: 'User Logged out successfully....!' });
});

export const sendVerificationCode = asyncHandler(async (req, res) => {
  await authService.sendVerificationCodeForEmail(req.user!.email);
  res.status(200).json({ success: true, message: 'Verification Code sent Successfully..!' });
});

export const verifyVerificationCode = asyncHandler(async (req, res) => {
  await authService.verifyVerificationCode(req.user!.email, req.body);
  res.status(200).json({ success: true, message: 'User Acccount verified successfully!' });
});

export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePasswordForUser(req.user?.userId, req.user?.verified, req.body);
  res.status(200).json({ success: true, message: 'Password Changed successfully!' });
});

export const sendForgotPasswordCode = asyncHandler(async (req, res) => {
  await authService.sendForgotPasswordCode(req.body);
  res.status(200).json({ success: true, message: 'Forgot Password Code sent Successfully..!' });
});

export const verifyForgotPasswordCode = asyncHandler(async (req, res) => {
  await authService.verifyForgotPasswordCode(req.body);
  res.status(200).json({ success: true, message: 'User Acccount Password updated successfully!' });
});
