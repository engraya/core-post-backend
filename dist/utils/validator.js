"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePostSchema = exports.createPostSchema = exports.forgotPasswordCodeSchema = exports.changePasswordSchema = exports.verifyVerificationCodeSchema = exports.userLoginSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// Define the Joi schema for user registration
exports.userRegisterSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email({ tlds: { allow: false } }) // Ensures a valid email address without restricting specific domains
        .required()
        .messages({
        'string.base': 'Email must be a string',
        'string.empty': 'Email cannot be empty',
        'string.email': 'Email must be a valid email address',
        'any.required': 'Email is required'
    }),
    password: joi_1.default.string()
        .min(8) // Password must be at least 8 characters long
        .max(30) // Optional: adjust to your preferred max length
        .pattern(/^[a-zA-Z0-9!@#$%^&*()_+=-]*$/) // Optional: validate for specific password patterns (e.g., no spaces)
        .required()
        .messages({
        'string.base': 'Password must be a string',
        'string.empty': 'Password cannot be empty',
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password must not exceed 30 characters',
        'string.pattern.base': 'Password contains invalid characters',
        'any.required': 'Password is required'
    })
});
exports.userLoginSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email({ tlds: { allow: false } }) // Ensures a valid email address without restricting specific domains
        .required()
        .messages({
        'string.base': 'Email must be a string',
        'string.empty': 'Email cannot be empty',
        'string.email': 'Email must be a valid email address',
        'any.required': 'Email is required'
    }),
    password: joi_1.default.string()
        .min(6) // Password must be at least 6 characters long (you can adjust this length as needed)
        .required()
        .messages({
        'string.base': 'Password must be a string',
        'string.empty': 'Password cannot be empty',
        'string.min': 'Password must be at least 6 characters long', // You can adjust this based on your password policy
        'any.required': 'Password is required'
    })
});
exports.verifyVerificationCodeSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email({ tlds: { allow: false } }) // Ensures a valid email address without restricting specific domains
        .required()
        .messages({
        'string.base': 'Email must be a string',
        'string.empty': 'Email cannot be empty',
        'string.email': 'Email must be a valid email address',
        'any.required': 'Email is required'
    }),
    code: joi_1.default.number().required()
});
exports.changePasswordSchema = joi_1.default.object({
    newPassword: joi_1.default.string()
        .min(6) // Password must be at least 6 characters long (you can adjust this length as needed)
        .required()
        .messages({
        'string.base': 'Password must be a string',
        'string.empty': 'Password cannot be empty',
        'string.min': 'Password must be at least 6 characters long', // You can adjust this based on your password policy
        'any.required': 'Password is required'
    }),
    oldPassword: joi_1.default.string()
        .min(6) // Password must be at least 6 characters long (you can adjust this length as needed)
        .required()
        .messages({
        'string.base': 'Password must be a string',
        'string.empty': 'Password cannot be empty',
        'string.min': 'Password must be at least 6 characters long', // You can adjust this based on your password policy
        'any.required': 'Password is required'
    })
});
exports.forgotPasswordCodeSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email({ tlds: { allow: false } }) // Ensures a valid email address without restricting specific domains
        .required()
        .messages({
        'string.base': 'Email must be a string',
        'string.empty': 'Email cannot be empty',
        'string.email': 'Email must be a valid email address',
        'any.required': 'Email is required'
    }),
    newPassword: joi_1.default.string()
        .min(6) // Password must be at least 6 characters long (you can adjust this length as needed)
        .required()
        .messages({
        'string.base': 'Password must be a string',
        'string.empty': 'Password cannot be empty',
        'string.min': 'Password must be at least 6 characters long', // You can adjust this based on your password policy
        'any.required': 'Password is required'
    }),
    code: joi_1.default.number().required()
});
exports.createPostSchema = joi_1.default.object({
    title: joi_1.default.string().required().min(3).max(50).required(),
    description: joi_1.default.string().min(3).max(500).required(),
    userId: joi_1.default.string().required()
});
exports.updatePostSchema = joi_1.default.object({
    title: joi_1.default.string().required().min(3).max(50).required(),
    description: joi_1.default.string().min(3).max(500).required(),
});
