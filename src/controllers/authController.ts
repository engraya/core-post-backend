import { asyncHandler } from '../middlewares/asyncHandler';
import * as authService from '../services/authService';
import { config } from '../config/env';

/** Registers a new user, hashes the password, and emails a verification OTP. */
export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  res.status(201).json({
    success: true,
    message: 'Account created. Check your email for a verification code.',
    data: result,
  });
});

/** Validates credentials, issues a JWT, and sets the httpOnly session cookie. */
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

/** Clears the auth cookie so the client is no longer signed in. */
export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie('Authorization', { path: '/' });
  res.status(200).json({ success: true, message: 'User Logged out successfully....!' });
});

/** Sends a new email verification code to an unverified user. */
export const sendVerificationCode = asyncHandler(async (req, res) => {
  await authService.sendVerificationCodeForEmail(req.body);
  res.status(200).json({ success: true, message: 'Verification Code sent Successfully..!' });
});

/** Confirms the signup OTP, marks the user verified, and returns a fresh JWT and cookie. */
export const verifyVerificationCode = asyncHandler(async (req, res) => {
  const { token, user } = await authService.verifyVerificationCode(req.body);
  res.cookie('Authorization', token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
    maxAge: 3600000,
    path: '/',
  });
  res.status(200).json({
    success: true,
    message: 'User account verified successfully!',
    data: { token, user },
  });
});

/** Authenticated user changes password after validating the current one. */
export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePasswordForUser(req.user?.userId, req.user?.verified, req.body);
  res.status(200).json({ success: true, message: 'Password Changed successfully!' });
});

export const sendForgotPasswordCode = asyncHandler(async (req, res) => {
  await authService.sendForgotPasswordCode(req.body);
  res.status(200).json({ success: true, message: 'Forgot Password Code sent Successfully..!' });
});

/** Verifies the reset code and sets a new password in one step. */
export const verifyForgotPasswordCode = asyncHandler(async (req, res) => {
  await authService.verifyForgotPasswordCode(req.body);
  res.status(200).json({ success: true, message: 'User account password updated successfully!' });
});
