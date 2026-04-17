import jwt from 'jsonwebtoken';
import User from '../models/userModel';
import { config } from '../config/env';
import { AppError } from '../errors/AppError';
import { doHash, doHashValidation, hmacProcess } from '../utils/hashing';
import { mailTransport } from '../utils/sendMail';
import {
  userRegisterSchema,
  userLoginSchema,
  verifyVerificationCodeSchema,
  changePasswordSchema,
  forgotPasswordSendSchema,
  forgotPasswordCodeSchema,
} from '../utils/validator';
import { generateSixDigitOtp } from '../utils/otp';

function validationMessage(error: { details: { message: string }[] } | undefined): string {
  return error?.details[0]?.message ?? 'Validation failed';
}

function otpEmailHtml(code: string): string {
  return `<h1>${code}</h1>`;
}

export async function registerUser(body: { email?: string; password?: string }) {
  const { error, value } = userRegisterSchema.validate(body);
  if (error) {
    throw new AppError(400, validationMessage(error));
  }

  const { email, password } = value;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(409, 'User already exists!');
  }

  const hashedPassword = await doHash(password, 12);
  const newUser = new User({ email, password: hashedPassword });
  const result = await newUser.save();
  const obj = result.toObject();
  delete (obj as { password?: string }).password;
  return obj;
}

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

export async function sendVerificationCodeForEmail(authedEmail: string) {
  const existingUser = await User.findOne({ email: authedEmail });
  if (!existingUser) {
    throw new AppError(404, 'User does not exist!');
  }
  if (existingUser.verified) {
    throw new AppError(400, 'User already verified!');
  }

  const verificationCodeValue = generateSixDigitOtp();
  const info = await mailTransport.sendMail({
    from: config.mailFrom,
    to: existingUser.email,
    subject: 'Verification Code',
    html: otpEmailHtml(verificationCodeValue),
  });

  if (info.accepted[0] !== existingUser.email) {
    throw new AppError(502, 'Verification code could not be sent.');
  }

  const hashedVerificationCodeValue = hmacProcess(verificationCodeValue, config.hmacKey);
  existingUser.verificationCode = hashedVerificationCodeValue;
  existingUser.verificationCodeValidation = Date.now();
  await existingUser.save();
}

export async function verifyVerificationCode(
  tokenEmail: string,
  body: { email?: string; code?: string },
) {
  const { error, value } = verifyVerificationCodeSchema.validate(body);
  if (error) {
    throw new AppError(400, validationMessage(error));
  }

  const { email, code } = value;
  if (email.toLowerCase() !== tokenEmail.toLowerCase()) {
    throw new AppError(400, 'Email does not match the authenticated user.');
  }

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
}

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
  const info = await mailTransport.sendMail({
    from: config.mailFrom,
    to: existingUser.email,
    subject: 'Forgot Password Code',
    html: otpEmailHtml(verificationCodeValue),
  });

  if (info.accepted[0] !== existingUser.email) {
    throw new AppError(502, 'Password reset code could not be sent.');
  }

  const hashedVerificationCodeValue = hmacProcess(verificationCodeValue, config.hmacKey);
  existingUser.forgotPasswordCode = hashedVerificationCodeValue;
  existingUser.forgotPasswordCodeValidation = Date.now();
  await existingUser.save();
}

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
