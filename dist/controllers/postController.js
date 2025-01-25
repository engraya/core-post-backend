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
exports.deletePost = exports.updatePost = exports.getSinglePost = exports.createPost = exports.allPosts = void 0;
const postModel_1 = __importDefault(require("../models/postModel"));
const { createPostSchema, updatePostSchema } = require('../utils/validator');
const allPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page } = req.query;
    const per_page = 10;
    try {
        let page_number = 0;
        // Cast page to number and handle pagination logic
        if (page && Number(page) > 1) {
            page_number = Number(page) - 1;
        }
        // Fetch posts with pagination, sorting, and population
        const result = yield postModel_1.default.find()
            .sort({ createdAt: -1 }) // Sort by createdAt in descending order
            .skip(page_number * per_page)
            .limit(per_page) // Corrected typo
            .populate({
            path: 'userId',
            select: 'email' // Only select the email from the user
        });
        // Send the result as a response
        res.status(200).json({ success: true, message: 'Post Data retrieved successfullly!', data: result });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.allPosts = allPosts;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { title, description } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(400).json({ success: false, message: 'User not authenticated' });
    }
    try {
        const { error } = createPostSchema.validate({ title, description, userId });
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message });
        }
        // Create a new post instance
        const newPost = yield postModel_1.default.create({ title, description, userId });
        // Send success response
        res.status(201).json({
            success: true,
            message: 'Post created successfully!',
            data: newPost
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create post.' });
    }
});
exports.createPost = createPost;
const getSinglePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.params;
    try {
        // Find the post by ID and populate the userId field
        const post = yield postModel_1.default.findById(_id).populate({
            path: 'userId',
            select: 'email'
        });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        // Send success response
        res.status(200).json({
            success: true,
            message: 'Post retrieved successfully!',
            data: post
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve post.' });
    }
});
exports.getSinglePost = getSinglePost;
const updatePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.params; // Get post ID from URL parameters
    const { title, description } = req.body; // Get new data from request body
    try {
        const { error } = updatePostSchema.validate({ title, description });
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message });
        }
        // Find the post by ID and update it
        const updatedPost = yield postModel_1.default.findByIdAndUpdate(_id, { title, description }, { new: true });
        if (!updatedPost) {
            return res.status(404).json({ message: 'Post not found' });
        }
        // Send success response
        res.status(200).json({
            success: true,
            message: 'Post updated successfully!',
            data: updatedPost
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update post.' });
    }
});
exports.updatePost = updatePost;
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.params; // Get post ID from URL parameters
    try {
        // Find the post by ID and delete it
        const deletedPost = yield postModel_1.default.findByIdAndDelete(_id);
        if (!deletedPost) {
            return res.status(404).json({ message: 'Post not found' });
        }
        // Send success response
        res.status(200).json({
            success: true,
            message: 'Post deleted successfully!'
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete post.' });
    }
});
exports.deletePost = deletePost;
