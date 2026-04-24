import { asyncHandler } from '../middlewares/asyncHandler';
import * as postService from '../services/postService';

/** Paginated list of posts, newest first. */
export const allPosts = asyncHandler(async (req, res) => {
  const result = await postService.listPosts(req.query.page as string | undefined);
  res.status(200).json({
    success: true,
    message: 'Post Data retrieved successfully!',
    data: result,
  });
});

/** Creates a post for the authenticated (verified) user. */
export const createPost = asyncHandler(async (req, res) => {
  const newPost = await postService.createPostForUser(req.user?.userId, req.body);
  res.status(201).json({
    success: true,
    message: 'Post created successfully!',
    data: newPost,
  });
});

/** Fetches one post; optional auth adds per-viewer like/bookmark flags. */
export const getSinglePost = asyncHandler(async (req, res) => {
  const post = await postService.getSinglePost(req.params._id, req.user?.userId);
  res.status(200).json({
    success: true,
    message: 'Post retrieved successfully!',
    data: post,
  });
});

/** Updates a post if the current user is the author. */
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

/** Deletes a post, its comments, and engagement rows if the current user is the author. */
export const deletePost = asyncHandler(async (req, res) => {
  await postService.deletePostForOwner(req.user?.userId, req.params._id);
  res.status(200).json({
    success: true,
    message: 'Post deleted successfully!',
  });
});
