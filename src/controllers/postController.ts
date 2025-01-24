import { Request, Response } from 'express';
import Post from '../models/postModel';
const { createPostSchema, updatePostSchema } = require('../utils/validator');
export const allPosts = async (req: Request, res: Response) => {
    const { page } = req.query;
    const per_page = 10;
    
    try {
        let page_number = 0;

        // Cast page to number and handle pagination logic
        if (page && Number(page) > 1) {
            page_number = Number(page) - 1;
        }

        // Fetch posts with pagination, sorting, and population
        const result = await Post.find()
            .sort({ createdAt: -1 })  // Sort by createdAt in descending order
            .skip(page_number * per_page)
            .limit(per_page)  // Corrected typo
            .populate({
                path: 'userId',
                select: 'email'  // Only select the email from the user
            });

        // Send the result as a response
        res.status(200).json({ success: true, message: 'Post Data retrieved successfullly!', data : result });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createPost = async (req: Request, res: Response) => {
    const { title, description } = req.body;
    const userId = req.user?.userId; 

    if (!userId) {
        return res.status(400).json({ success: false, message: 'User not authenticated' });
    }
    try {

        const { error } = createPostSchema.validate({ title, description, userId });
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message });
        }
        // Create a new post instance
        const newPost = await Post.create({title, description, userId });

        // Send success response
        res.status(201).json({
            success: true,
            message: 'Post created successfully!',
            data: newPost
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create post.' });
    }
};

export const getSinglePost = async (req: Request, res: Response) => {
    const { _id } = req.params; 

    try {
        // Find the post by ID and populate the userId field
        const post = await Post.findById(_id).populate({
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve post.' });
    }
};

export const updatePost = async (req: Request, res: Response) => {
    const { _id } = req.params; // Get post ID from URL parameters
    const { title, description } = req.body; // Get new data from request body

    try {
        const { error } = updatePostSchema.validate({ title, description });
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message });
        }

        // Find the post by ID and update it
        const updatedPost = await Post.findByIdAndUpdate(_id, { title, description }, { new: true });

        if (!updatedPost) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Send success response
        res.status(200).json({
            success: true,
            message: 'Post updated successfully!',
            data: updatedPost
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update post.' });
    }
};


export const deletePost = async (req: Request, res: Response) => {
    const { _id } = req.params; // Get post ID from URL parameters

    try {
        // Find the post by ID and delete it
        const deletedPost = await Post.findByIdAndDelete(_id);

        if (!deletedPost) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Send success response
        res.status(200).json({
            success: true,
            message: 'Post deleted successfully!'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete post.' });
    }
};
