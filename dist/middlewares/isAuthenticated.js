"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const isAuthenticated = (req, res, next) => {
    var _a;
    const token = req.cookies.Authorization || ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1]);
    if (!token) {
        res.status(401).json({ success: false, message: 'UnAuthorized. Please log in to continue.' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            verified: decoded.verified,
        };
        next();
    }
    catch (_b) {
        res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
};
exports.isAuthenticated = isAuthenticated;
