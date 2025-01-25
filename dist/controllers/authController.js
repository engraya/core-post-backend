"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyForgotPasswordCode = exports.sendForgotPasswordCode = exports.changePassword = exports.verifyVerificationCode = exports.sendVerificationCode = exports.logout = exports.login = exports.register = void 0;
const { userRegisterSchema, userLoginSchema, forgotPasswordCodeSchema, verifyVerificationCodeSchema, changePasswordSchema } = require('../utils/validator');
const userModel_1 = __importDefault(require("../models/userModel"));
const hashing_1 = require("../utils/hashing");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const transport = require('../utils/sendMail');
const hashing_2 = require("../utils/hashing");
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const { error } = userRegisterSchema.validate({ email, password });
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message });
        }
        const existingUser = yield userModel_1.default.findOne({ email });
        if (existingUser) {
            return res.status(401).json({ success: false, message: "User already exist..!" });
        }
        const hashedPassword = yield (0, hashing_1.doHash)(password, 12);
        const newUser = new userModel_1.default({
            email,
            password: hashedPassword
        });
        const result = yield newUser.save();
        // @ts-ignore
        result.password = undefined;
        res.status(201).json({
            success: true,
            message: 'User Account created Successfully....!',
            result
        });
    }
    catch (error) {
        console.log(error);
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Validate incoming data
        const { error } = userLoginSchema.validate({ email, password });
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message });
        }
        // Check if user exists
        const existingUser = yield userModel_1.default.findOne({ email }).select('+password');
        if (!existingUser) {
            return res.status(401).json({ success: false, message: 'User does not exist!' });
        }
        // Compare provided password with stored password
        const isPasswordValid = yield (0, hashing_1.doHashValidation)(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid email or password!' });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: existingUser._id, email: existingUser.email, verified: existingUser.verified }, process.env.JWT_SECRET, // Use your secret key here
        { expiresIn: '1h' } // Token expiry time (adjust as needed)
        );
        // Set the JWT token in an HTTP-only cookie
        res.cookie('Authorization', token, {
            httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
            secure: process.env.NODE_ENV === 'production', // Only set the cookie over HTTPS in production
            sameSite: 'strict', // Helps protect against CSRF attacks
            maxAge: 3600000, // Cookie expires in 1 hour (1h)
            path: '/' // The cookie is available throughout the application
        });
        // Send the response with the token
        res.status(200).json({
            success: true,
            message: 'Login successful!',
            token,
            user: {
                id: existingUser._id,
                email: existingUser.email
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred during login.' });
    }
});
exports.login = login;
const logout = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie('Authorization').status(200).json({ success: true, message: 'User Logged out successfully....!' });
});
exports.logout = logout;
const sendVerificationCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        // Check if user exists
        const existingUser = yield userModel_1.default.findOne({ email });
        if (!existingUser) {
            return res.status(401).json({ success: false, message: 'User does not exist!' });
        }
        if (existingUser.verified) {
            return res.status(401).json({ success: false, message: 'User already verified!' });
        }
        const verificationCodeValue = Math.floor(Math.random() * 1000000).toString();
        let info = yield transport.sendMail({
            from: process.env.NODE_VERIFICATIONCODE_SENDING_EMAIL_ADDRESS,
            to: existingUser.email,
            subject: 'Verification Code',
            html: '<h1>' + verificationCodeValue + '<h1>'
        });
        if (info.accepted[0] === existingUser.email) {
            const hmacKey = process.env.HMACPROCESS_KEY;
            // Check if the key is defined
            if (!hmacKey) {
                return res.status(500).json({
                    success: false,
                    message: 'HMAC process key is not defined in the environment variables.'
                });
            }
            const hashedVerificationCodeValue = (0, hashing_2.hmacProcess)(verificationCodeValue, hmacKey);
            existingUser.verificationCode = hashedVerificationCodeValue;
            existingUser.verificationCodeValidation = Date.now();
            yield existingUser.save();
            return res.status(200).json({
                success: true,
                message: 'Verification Code sent Successfully..!'
            });
        }
        res.status(200).json({ success: false, message: 'Verification Code sent Failed..!' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred when sending verification code.' });
    }
});
exports.sendVerificationCode = sendVerificationCode;
const verifyVerificationCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, code } = req.body;
    try {
        // Validate incoming data
        const { error } = verifyVerificationCodeSchema.validate({ email, code });
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message });
        }
        const codeValue = code.toString();
        // Check if user exists
        const existingUser = yield userModel_1.default.findOne({ email }).select('+ verificationCode + verificationCodeValidation');
        if (!existingUser) {
            return res.status(401).json({ success: false, message: 'User does not exist!' });
        }
        if (existingUser.verified) {
            return res.status(400).json({ success: false, message: 'User already verified!' });
        }
        if (!existingUser || !existingUser.verificationCodeValidation) {
            return res.status(400).json({ success: false, message: 'Something went wrong!' });
        }
        if (Date.now() - Number(existingUser.verificationCodeValidation) > 5 * 60 * 1000) {
            return res.status(400).json({ success: false, message: 'Verification code has expired!' });
        }
        const hashedVerificationCodeValue = (0, hashing_2.hmacProcess)(codeValue, process.env.HMACPROCESS_KEY);
        if (hashedVerificationCodeValue === existingUser.verificationCode) {
            existingUser.verified = true;
            existingUser.verificationCode = undefined;
            existingUser.verificationCodeValidation = undefined;
            yield existingUser.save();
            return res.status(200).json({ success: true, message: 'User Acccount verified successfully!' });
        }
        return res.status(400).json({ success: true, message: 'Unexpected Error occured!' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred when sending verification code.' });
    }
});
exports.verifyVerificationCode = verifyVerificationCode;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const verified = (_b = req.user) === null || _b === void 0 ? void 0 : _b.verified;
    const { oldPassword, newPassword } = req.body;
    try {
        // Validate incoming data
        const { error } = changePasswordSchema.validate({ oldPassword, newPassword });
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message });
        }
        if (!verified) {
            return res.status(401).json({ success: false, message: 'User not verified!' });
        }
        // Check if user exists
        const existingUser = yield userModel_1.default.findOne({ _id: userId }).select('+password');
        if (!existingUser) {
            return res.status(401).json({ success: false, message: 'User does not exist!' });
        }
        // Compare provided password with stored password
        const passwordResult = yield (0, hashing_1.doHashValidation)(oldPassword, existingUser.password);
        if (!passwordResult) {
            return res.status(401).json({ success: false, message: 'Invalid credentials!' });
        }
        const hashedPassword = yield (0, hashing_1.doHash)(newPassword, 12);
        existingUser.password = hashedPassword;
        yield existingUser.save();
        return res.status(200).json({ success: true, message: 'Password Changed successfully!' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred during login.' });
    }
});
exports.changePassword = changePassword;
const sendForgotPasswordCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        // Check if user exists
        const existingUser = yield userModel_1.default.findOne({ email });
        if (!existingUser) {
            return res.status(401).json({ success: false, message: 'User does not exist!' });
        }
        const verificationCodeValue = Math.floor(Math.random() * 1000000).toString();
        let info = yield transport.sendMail({
            from: process.env.NODE_VERIFICATIONCODE_SENDING_EMAIL_ADDRESS,
            to: existingUser.email,
            subject: 'Forgot Password Code',
            html: '<h1>' + verificationCodeValue + '<h1>'
        });
        if (info.accepted[0] === existingUser.email) {
            const hmacKey = process.env.HMACPROCESS_KEY;
            // Check if the key is defined
            if (!hmacKey) {
                return res.status(500).json({
                    success: false,
                    message: 'HMAC process key is not defined in the environment variables.'
                });
            }
            const hashedVerificationCodeValue = (0, hashing_2.hmacProcess)(verificationCodeValue, hmacKey);
            existingUser.forgotPasswordCode = hashedVerificationCodeValue;
            existingUser.forgotPasswordCodeValidation = Date.now();
            yield existingUser.save();
            return res.status(200).json({
                success: true,
                message: 'Forgot Password Code sent Successfully..!'
            });
        }
        res.status(200).json({ success: false, message: 'Verification Code sent Failed..!' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred when sending verification code.' });
    }
});
exports.sendForgotPasswordCode = sendForgotPasswordCode;
const verifyForgotPasswordCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, code, newPassword } = req.body;
    try {
        // Validate incoming data
        const { error } = forgotPasswordCodeSchema.validate({ email, code, newPassword });
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message });
        }
        const codeValue = code.toString();
        // Check if user exists
        const existingUser = yield userModel_1.default.findOne({ email }).select('+ forgotPasswordCode + forgotPasswordCodeValidation');
        if (!existingUser) {
            return res.status(401).json({ success: false, message: 'User does not exist!' });
        }
        if (!existingUser || !existingUser.forgotPasswordCodeValidation) {
            return res.status(400).json({ success: false, message: 'Something went wrong!' });
        }
        if (Date.now() - Number(existingUser.forgotPasswordCodeValidation) > 5 * 60 * 1000) {
            return res.status(400).json({ success: false, message: 'Forgot Password code has expired!' });
        }
        const hashedVerificationCodeValue = (0, hashing_2.hmacProcess)(codeValue, process.env.HMACPROCESS_KEY);
        if (hashedVerificationCodeValue === existingUser.forgotPasswordCode) {
            const hashedPassword = yield (0, hashing_1.doHash)(newPassword, 12);
            existingUser.password = hashedPassword;
            existingUser.forgotPasswordCode = undefined;
            existingUser.forgotPasswordCodeValidation = undefined;
            yield existingUser.save();
            return res.status(200).json({ success: true, message: 'User Acccount Password updated successfully!' });
        }
        return res.status(400).json({ success: true, message: 'Unexpected Error occured!' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred when sending verification code.' });
    }
});
exports.verifyForgotPasswordCode = verifyForgotPasswordCode;
