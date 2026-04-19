import { asyncHandler } from '../middlewares/asyncHandler';
import * as postService from '../services/postService';

export const allPosts = asyncHandler(async (req, res) => {
  const result = await postService.listPosts(req.query.page as string | undefined);
  res.status(200).json({
    success: true,
    message: 'Post Data retrieved successfully!',
    data: result,
  });
});

export const createPost = asyncHandler(async (req, res) => {
  const newPost = await postService.createPostForUser(req.user?.userId, req.body);
  res.status(201).json({
    success: true,
    message: 'Post created successfully!',
    data: newPost,
  });
});

export const getSinglePost = asyncHandler(async (req, res) => {
  const post = await postService.getSinglePost(req.params._id);
  res.status(200).json({
    success: true,
    message: 'Post retrieved successfully!',
    data: post,
  });
});

export const updatePost = asyncHandler(async (req, res) => {
  const updatedPost = await postService.updatePostForOwner(
    req.user?.userId,
    req.params._id,
    req.body,
  );
  res.status(200).json({
    success: true,
    message: 'Post updated successfully!',
    data: updatedPost,
  });
});

export const deletePost = asyncHandler(async (req, res) => {
  await postService.deletePostForOwner(req.user?.userId, req.params._id);
  res.status(200).json({
    success: true,
    message: 'Post deleted successfully!',
  });
});
