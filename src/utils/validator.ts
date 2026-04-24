import Joi from 'joi';

/** Reusable password policy: length, allowed symbols, and user-facing error messages. */
const passwordRules = Joi.string()
  .min(8)
  .max(30)
  .pattern(/^[a-zA-Z0-9!@#$%^&*()_+=-]*$/)
  .required()
  .messages({
    'string.base': 'Password must be a string',
    'string.empty': 'Password cannot be empty',
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password must not exceed 30 characters',
    'string.pattern.base': 'Password contains invalid characters',
    'any.required': 'Password is required',
  });

/** Six-digit numeric OTP for verification and password-reset bodies. */
const otpCodeSchema = Joi.string()
  .pattern(/^\d{6}$/)
  .required()
  .messages({
    'string.pattern.base': 'Code must be a 6-digit number',
  });

/** Signup payload: email, password, optional display name. */
export const userRegisterSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.base': 'Email must be a string',
      'string.empty': 'Email cannot be empty',
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required',
    }),
  password: passwordRules,
  displayName: Joi.string().trim().min(1).max(60).optional(),
});

/** Optional image URL: http(s), null, or empty string to clear. */
const avatarUrlSchema = Joi.string()
  .uri({ scheme: ['http', 'https'] })
  .max(2048)
  .allow('', null)
  .optional()
  .messages({
    'string.uri': 'Avatar URL must be a valid http or https URL',
  });

/** `PATCH /users/me`: at least one of displayName or avatarUrl. */
export const updateProfileSchema = Joi.object({
  displayName: Joi.string().trim().min(1).max(60).optional().messages({
    'string.empty': 'Display name cannot be empty',
  }),
  avatarUrl: avatarUrlSchema,
})
  .or('displayName', 'avatarUrl')
  .messages({
    'object.missing': 'At least one of displayName or avatarUrl must be provided',
  });

/** Login credentials. */
export const userLoginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.base': 'Email must be a string',
      'string.empty': 'Email cannot be empty',
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required',
    }),
  password: passwordRules,
});

/** Body for confirming signup email with 6-digit code. */
export const verifyVerificationCodeSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.base': 'Email must be a string',
      'string.empty': 'Email cannot be empty',
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required',
    }),
  code: otpCodeSchema,
});

/** Unauthenticated: request a new verification email (email only). */
export const sendVerificationEmailSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.base': 'Email must be a string',
      'string.empty': 'Email cannot be empty',
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required',
    }),
});

/** Authenticated password change: current + new password. */
export const changePasswordSchema = Joi.object({
  oldPassword: passwordRules,
  newPassword: passwordRules,
});

/** First step of forgot password: email only. */
export const forgotPasswordSendSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.base': 'Email must be a string',
      'string.empty': 'Email cannot be empty',
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required',
    }),
});

/** Second step: 6-digit code plus new password. */
export const forgotPasswordCodeSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.base': 'Email must be a string',
      'string.empty': 'Email cannot be empty',
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required',
    }),
  newPassword: passwordRules,
  code: otpCodeSchema,
});

/** New post with validated `userId` from the service layer. */
export const createPostSchema = Joi.object({
  title: Joi.string().required().min(3).max(50),
  description: Joi.string().min(3).max(500).required(),
  userId: Joi.string().required(),
});

/** Full post replace on update. */
export const updatePostSchema = Joi.object({
  title: Joi.string().required().min(3).max(50),
  description: Joi.string().min(3).max(500).required(),
});

/** New comment text. */
export const createCommentSchema = Joi.object({
  body: Joi.string().trim().min(1).max(2000).required().messages({
    'string.empty': 'Comment cannot be empty',
  }),
});

/** Comment body on edit. */
export const updateCommentSchema = Joi.object({
  body: Joi.string().trim().min(1).max(2000).required().messages({
    'string.empty': 'Comment cannot be empty',
  }),
});
