import express from 'express';
const authController = require('../controllers/authController')
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);


router.post('/logout', authController.logout);
router.patch('/send-verification-code', authController.sendVerificationCode);
router.patch('/verify-verification-code', authController.verifyVerificationCode);
router.patch('/change-password', authController.changePassword);
router.patch('/send-forgot-password-code', authController.sendForgotPasswordCode);
router.patch('/verify-forgot-password-code', authController.verifyForgotPasswordCode);


module.exports = router