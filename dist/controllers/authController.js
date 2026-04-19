"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyForgotPasswordCode = exports.sendForgotPasswordCode = exports.changePassword = exports.verifyVerificationCode = exports.sendVerificationCode = exports.logout = exports.login = exports.register = void 0;
const asyncHandler_1 = require("../middlewares/asyncHandler");
const authService = __importStar(require("../services/authService"));
const env_1 = require("../config/env");
exports.register = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield authService.registerUser(req.body);
    res.status(201).json({
        success: true,
        message: 'Account created. Check your email for a verification code.',
        data: result,
    });
}));
exports.login = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, user } = yield authService.loginUser(req.body);
    res.cookie('Authorization', token, {
        httpOnly: true,
        secure: env_1.config.nodeEnv === 'production',
        sameSite: 'strict',
        maxAge: 3600000,
        path: '/',
    });
    res.status(200).json({
        success: true,
        message: 'Login successful!',
        data: { token, user },
    });
}));
exports.logout = (0, asyncHandler_1.asyncHandler)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie('Authorization', { path: '/' });
    res.status(200).json({ success: true, message: 'User Logged out successfully....!' });
}));
exports.sendVerificationCode = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield authService.sendVerificationCodeForEmail(req.body);
    res.status(200).json({ success: true, message: 'Verification Code sent Successfully..!' });
}));
exports.verifyVerificationCode = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, user } = yield authService.verifyVerificationCode(req.body);
    res.cookie('Authorization', token, {
        httpOnly: true,
        secure: env_1.config.nodeEnv === 'production',
        sameSite: 'strict',
        maxAge: 3600000,
        path: '/',
    });
    res.status(200).json({
        success: true,
        message: 'User account verified successfully!',
        data: { token, user },
    });
}));
exports.changePassword = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    yield authService.changePasswordForUser((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId, (_b = req.user) === null || _b === void 0 ? void 0 : _b.verified, req.body);
    res.status(200).json({ success: true, message: 'Password Changed successfully!' });
}));
exports.sendForgotPasswordCode = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield authService.sendForgotPasswordCode(req.body);
    res.status(200).json({ success: true, message: 'Forgot Password Code sent Successfully..!' });
}));
exports.verifyForgotPasswordCode = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield authService.verifyForgotPasswordCode(req.body);
    res.status(200).json({ success: true, message: 'User account password updated successfully!' });
}));
