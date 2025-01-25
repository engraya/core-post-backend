"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
const authRouter = require('./routers/authRouter');
const postRouter = require('./routers/postRouter');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api/auth', authRouter);
app.use('/api/posts', postRouter);
app.get('/', (_req, res) => {
    res.json({ message: "Hello from Express" });
});
app.listen(process.env.PORT, () => {
    console.log(`App Listening on Port ${process.env.PORT}`);
});
if (process.env.MONGODB_URI) {
    mongoose_1.default.connect(process.env.MONGODB_URI)
        .then(() => console.log('MongoDB Database connected successfully..!!'))
        .catch(err => console.error('MongoDB connection error:', err));
}
else {
    throw new Error('MONGODB_URI environment variable is not defined');
}
