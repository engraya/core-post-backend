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
Object.defineProperty(exports, "__esModule", { value: true });
exports.hmacProcess = exports.doHashValidation = exports.doHash = void 0;
const bcryptjs_1 = require("bcryptjs");
const crypto_1 = require("crypto");
const doHash = (value, saltValue) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, bcryptjs_1.hash)(value, saltValue);
});
exports.doHash = doHash;
const doHashValidation = (value, hashedValue) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, bcryptjs_1.compare)(value, hashedValue);
});
exports.doHashValidation = doHashValidation;
const hmacProcess = (value, key) => {
    return (0, crypto_1.createHmac)('sha256', key).update(value).digest('hex');
};
exports.hmacProcess = hmacProcess;
