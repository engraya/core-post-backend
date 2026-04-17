import Joi from 'joi';

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

const otpCodeSchema = Joi.string()
  .pattern(/^\d{6}$/)
  .required()
  .messages({
    'string.pattern.base': 'Code must be a 6-digit number',
  });

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
});

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

export const changePasswordSchema = Joi.object({
  oldPassword: passwordRules,
  newPassword: passwordRules,
});

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

export const createPostSchema = Joi.object({
  title: Joi.string().required().min(3).max(50),
  description: Joi.string().min(3).max(500).required(),
  userId: Joi.string().required(),
});

export const updatePostSchema = Joi.object({
  title: Joi.string().required().min(3).max(50),
  description: Joi.string().min(3).max(500).required(),
});
