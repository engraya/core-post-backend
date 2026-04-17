"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePostSchema = exports.createPostSchema = exports.forgotPasswordCodeSchema = exports.forgotPasswordSendSchema = exports.changePasswordSchema = exports.verifyVerificationCodeSchema = exports.userLoginSchema = exports.userRegisterSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const passwordRules = joi_1.default.string()
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
const otpCodeSchema = joi_1.default.string()
    .pattern(/^\d{6}$/)
    .required()
    .messages({
    'string.pattern.base': 'Code must be a 6-digit number',
});
exports.userRegisterSchema = joi_1.default.object({
    email: joi_1.default.string()
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
exports.userLoginSchema = joi_1.default.object({
    email: joi_1.default.string()
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
exports.verifyVerificationCodeSchema = joi_1.default.object({
    email: joi_1.default.string()
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
exports.changePasswordSchema = joi_1.default.object({
    oldPassword: passwordRules,
    newPassword: passwordRules,
});
exports.forgotPasswordSendSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
        'string.base': 'Email must be a string',
        'string.empty': 'Email cannot be empty',
        'string.email': 'Email must be a valid email address',
        'any.required': 'Email is required',
    }),
});
exports.forgotPasswordCodeSchema = joi_1.default.object({
    email: joi_1.default.string()
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
exports.createPostSchema = joi_1.default.object({
    title: joi_1.default.string().required().min(3).max(50),
    description: joi_1.default.string().min(3).max(500).required(),
    userId: joi_1.default.string().required(),
});
exports.updatePostSchema = joi_1.default.object({
    title: joi_1.default.string().required().min(3).max(50),
    description: joi_1.default.string().min(3).max(500).required(),
});
