import jwt from 'jsonwebtoken';
import User from '../models/userModel';
import type { IUser } from '../models/userModel';
import { config } from '../config/env';
import { AppError } from '../errors/AppError';
import { doHash, doHashValidation, hmacProcess } from '../utils/hashing';
import { mailTransport } from '../utils/sendMail';
import {
  userRegisterSchema,
  userLoginSchema,
  verifyVerificationCodeSchema,
  sendVerificationEmailSchema,
  changePasswordSchema,
  forgotPasswordSendSchema,
  forgotPasswordCodeSchema,
} from '../utils/validator';
import { generateSixDigitOtp } from '../utils/otp';
import {
  buildOtpEmail,
  getOtpEmailSubject,
  buildAccountVerifiedEmail,
  getAccountVerifiedEmailSubject,
} from '../utils/emailTemplates';

/** First Joi error message, or a generic validation fallback. */
function validationMessage(error: { details: { message: string }[] } | undefined): string {
  return error?.details[0]?.message ?? 'Validation failed';
}

/**
 * Generates a 6-digit code, emails it, and persists an HMAC hash plus expiry on the user document.
 */
async function sendAndStoreEmailVerificationCode(
  user: IUser,
  templateKind: 'welcome' | 'verification',
): Promise<void> {
  const verificationCodeValue = generateSixDigitOtp();
  const { html, text } = buildOtpEmail(verificationCodeValue, templateKind);
  const info = await mailTransport.sendMail({
    from: config.mailFrom,
    to: user.email,
    subject: getOtpEmailSubject(templateKind),
    html,
    text,
  });

  if (info.accepted[0] !== user.email) {
    throw new AppError(502, 'Verification code could not be sent.');
  }

  user.verificationCode = hmacProcess(verificationCodeValue, config.hmacKey);
  user.verificationCodeValidation = Date.now();
  await user.save();
}

/** Sent after successful verification; failures are logged and do not roll back verification. */
async function sendAccountVerifiedConfirmationEmail(to: string): Promise<void> {
  const { html, text } = buildAccountVerifiedEmail(to);
  try {
    const info = await mailTransport.sendMail({
      from: config.mailFrom,
      to,
      subject: getAccountVerifiedEmailSubject(),
      html,
      text,
    });
    if (info.accepted[0] !== to) {
      console.error('Account verified confirmation email was not accepted for', to);
    }
  } catch (err) {
    console.error('Failed to send account verified confirmation email:', err);
  }
}

/** Validates input, creates an unverified user, and triggers the welcome verification email. */
export async function registerUser(body: {
  email?: string;
  password?: string;
  displayName?: string;
}) {
  const { error, value } = userRegisterSchema.validate(body);
  if (error) {
    throw new AppError(400, validationMessage(error));
  }

  const { email, password, displayName: displayNameRaw } = value;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(409, 'User already exists!');
  }

  const displayName =
    typeof displayNameRaw === 'string' && displayNameRaw.trim().length > 0
      ? displayNameRaw.trim()
      : email.split('@')[0] ?? 'User';

  const hashedPassword = await doHash(password, 12);
  const newUser = new User({ email, password: hashedPassword, displayName });
  const result = await newUser.save();
  await sendAndStoreEmailVerificationCode(result, 'welcome');
  const obj = result.toObject();
  delete (obj as { password?: string }).password;
  return obj;
}

/** Verifies email/password, requires verified email, and returns a short-lived JWT. */
export async function loginUser(body: { email?: string; password?: string }) {
  const { error, value } = userLoginSchema.validate(body);
  if (error) {
    throw new AppError(400, validationMessage(error));
  }

  const { email, password } = value;
  const existingUser = await User.findOne({ email }).select('+password');
  if (!existingUser) {
    throw new AppError(401, 'Invalid email or password!');
  }

  const isPasswordValid = await doHashValidation(password, existingUser.password);
  if (!isPasswordValid) {
    throw new AppError(401, 'Invalid email or password!');
  }

  if (!existingUser.verified) {
    throw new AppError(403, 'Please verify your email before signing in.');
  }

  const userIdStr = String(existingUser._id);
  const token = jwt.sign(
    {
      userId: userIdStr,
      email: existingUser.email,
      verified: existingUser.verified,
    },
    config.jwtSecret,
    { expiresIn: '1h' },
  );

  return {
    token,
    user: {
      id: userIdStr,
      email: existingUser.email,
    },
  };
}

/** Resends a verification OTP to an existing unverified account. */
export async function sendVerificationCodeForEmail(body: { email?: string }) {
  const { error, value } = sendVerificationEmailSchema.validate(body);
  if (error) {
    throw new AppError(400, validationMessage(error));
  }

  const { email } = value;
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    throw new AppError(404, 'User does not exist!');
  }
  if (existingUser.verified) {
    throw new AppError(400, 'User already verified!');
  }

  await sendAndStoreEmailVerificationCode(existingUser, 'verification');
}

/** Confirms the OTP, flips `verified`, clears code fields, and issues a new JWT. */
export async function verifyVerificationCode(body: { email?: string; code?: string }) {
  const { error, value } = verifyVerificationCodeSchema.validate(body);
  if (error) {
    throw new AppError(400, validationMessage(error));
  }

  const { email, code } = value;

  const existingUser = await User.findOne({ email }).select(
    '+verificationCode +verificationCodeValidation',
  );
  if (!existingUser) {
    throw new AppError(404, 'User does not exist!');
  }

  if (existingUser.verified) {
    throw new AppError(400, 'User already verified!');
  }

  if (!existingUser.verificationCodeValidation) {
    throw new AppError(400, 'No verification code pending. Request a new code.');
  }

  if (Date.now() - Number(existingUser.verificationCodeValidation) > 5 * 60 * 1000) {
    throw new AppError(400, 'Verification code has expired!');
  }

  const hashedVerificationCodeValue = hmacProcess(code, config.hmacKey);

  if (hashedVerificationCodeValue !== existingUser.verificationCode) {
    throw new AppError(400, 'Invalid verification code.');
  }

  existingUser.verified = true;
  existingUser.verificationCode = undefined;
  existingUser.verificationCodeValidation = undefined;
  await existingUser.save();

  await sendAccountVerifiedConfirmationEmail(existingUser.email);

  const userIdStr = String(existingUser._id);
  const token = jwt.sign(
    {
      userId: userIdStr,
      email: existingUser.email,
      verified: true,
    },
    config.jwtSecret,
    { expiresIn: '1h' },
  );

  return {
    token,
    user: {
      id: userIdStr,
      email: existingUser.email,
    },
  };
}

/** For a signed-in verified user, checks old password and sets a new bcrypt hash. */
export async function changePasswordForUser(
  userId: string | undefined,
  verified: boolean | undefined,
  body: { oldPassword?: string; newPassword?: string },
) {
  const { error, value } = changePasswordSchema.validate(body);
  if (error) {
    throw new AppError(400, validationMessage(error));
  }

  if (!userId) {
    throw new AppError(401, 'User not authenticated.');
  }

  if (!verified) {
    throw new AppError(403, 'User not verified!');
  }

  const { oldPassword, newPassword } = value;
  const existingUser = await User.findOne({ _id: userId }).select('+password');
  if (!existingUser) {
    throw new AppError(404, 'User does not exist!');
  }

  const passwordResult = await doHashValidation(oldPassword, existingUser.password);
  if (!passwordResult) {
    throw new AppError(401, 'Invalid credentials!');
  }

  existingUser.password = await doHash(newPassword, 12);
  await existingUser.save();
}

/** Stores a hashed password-reset code with a 5-minute window and emails the plain OTP. */
export async function sendForgotPasswordCode(body: { email?: string }) {
  const { error, value } = forgotPasswordSendSchema.validate(body);
  if (error) {
    throw new AppError(400, validationMessage(error));
  }

  const { email } = value;
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    throw new AppError(404, 'User does not exist!');
  }

  const verificationCodeValue = generateSixDigitOtp();
  const { html, text } = buildOtpEmail(verificationCodeValue, 'password-reset');
  const info = await mailTransport.sendMail({
    from: config.mailFrom,
    to: existingUser.email,
    subject: getOtpEmailSubject('password-reset'),
    html,
    text,
  });

  if (info.accepted[0] !== existingUser.email) {
    throw new AppError(502, 'Password reset code could not be sent.');
  }

  const hashedVerificationCodeValue = hmacProcess(verificationCodeValue, config.hmacKey);
  existingUser.forgotPasswordCode = hashedVerificationCodeValue;
  existingUser.forgotPasswordCodeValidation = Date.now();
  await existingUser.save();
}

/** Validates the reset code window and code, then sets the new password and clears reset state. */
export async function verifyForgotPasswordCode(body: {
  email?: string;
  code?: string;
  newPassword?: string;
}) {
  const { error, value } = forgotPasswordCodeSchema.validate(body);
  if (error) {
    throw new AppError(400, validationMessage(error));
  }

  const { email, code, newPassword } = value;
  const existingUser = await User.findOne({ email }).select(
    '+forgotPasswordCode +forgotPasswordCodeValidation',
  );
  if (!existingUser) {
    throw new AppError(404, 'User does not exist!');
  }

  if (!existingUser.forgotPasswordCodeValidation) {
    throw new AppError(400, 'No password reset pending. Request a new code.');
  }

  if (Date.now() - Number(existingUser.forgotPasswordCodeValidation) > 5 * 60 * 1000) {
    throw new AppError(400, 'Forgot Password code has expired!');
  }

  const hashedVerificationCodeValue = hmacProcess(code, config.hmacKey);

  if (hashedVerificationCodeValue !== existingUser.forgotPasswordCode) {
    throw new AppError(400, 'Invalid verification code.');
  }

  existingUser.password = await doHash(newPassword, 12);
  existingUser.forgotPasswordCode = undefined;
  existingUser.forgotPasswordCodeValidation = undefined;
  await existingUser.save();
}
