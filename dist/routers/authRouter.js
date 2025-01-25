"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController = require('../controllers/authController');
const router = express_1.default.Router();
const isAuthenticated_1 = require("../middlewares/isAuthenticated");
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', isAuthenticated_1.isAuthenticated, authController.logout);
router.patch('/send-verification-code', isAuthenticated_1.isAuthenticated, authController.sendVerificationCode);
router.patch('/verify-verification-code', isAuthenticated_1.isAuthenticated, authController.verifyVerificationCode);
router.patch('/change-password', isAuthenticated_1.isAuthenticated, authController.changePassword);
router.patch('/forgot-password', isAuthenticated_1.isAuthenticated, authController.sendForgotPasswordCode);
router.patch('/verify-forgot-password', isAuthenticated_1.isAuthenticated, authController.verifyForgotPasswordCode);
module.exports = router;
