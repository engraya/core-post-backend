"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const isAuthenticated = (req, res, next) => {
    var _a;
    // Get the token from the "Authorization" cookie or header
    const token = req.cookies.Authorization || ((_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1]);
    if (!token) {
        res.status(401).json({ success: false, message: 'UnAuthorized. Please log in to continue.' });
        return; // Don't return the Response, just end the execution here.
    }
    try {
        // Verify the token using the JWT secret
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Attach user information to the request object for further use in route handlers
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            verified: decoded.verified
        };
        // Proceed to the next middleware or route handler
        next();
    }
    catch (error) {
        res.status(401).json({ success: false, message: 'Invalid or expired token.' });
        return; // End execution after sending response.
    }
};
exports.isAuthenticated = isAuthenticated;
