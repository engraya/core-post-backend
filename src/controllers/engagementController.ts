import { asyncHandler } from '../middlewares/asyncHandler';
import * as engagementService from '../services/engagementService';

/** Public like count for a post. */
export const getLikeCount = asyncHandler(async (req, res) => {
  const data = await engagementService.getLikeCount(req.params.postId);
  res.status(200).json({
    success: true,
    message: 'Like count retrieved successfully!',
    data,
  });
});

/** Idempotent like: records a like or reports already liked. */
export const likePost = asyncHandler(async (req, res) => {
  const data = await engagementService.likePost(req.user?.userId, req.params.postId);
  res.status(200).json({
    success: true,
    message: data.alreadyLiked ? 'Post already liked.' : 'Post liked successfully!',
    data,
  });
});

/** Removes the current user’s like if present. */
export const unlikePost = asyncHandler(async (req, res) => {
  const data = await engagementService.unlikePost(req.user?.userId, req.params.postId);
  res.status(200).json({
    success: true,
    message: data.removed ? 'Like removed successfully!' : 'Post was not liked.',
    data,
  });
});

/** Idempotent bookmark: saves the post or reports already bookmarked. */
export const bookmarkPost = asyncHandler(async (req, res) => {
  const data = await engagementService.bookmarkPost(req.user?.userId, req.params.postId);
  res.status(200).json({
    success: true,
    message: data.alreadyBookmarked ? 'Post already bookmarked.' : 'Post bookmarked successfully!',
    data,
  });
});

/** Removes the current user’s bookmark if present. */
export const unbookmarkPost = asyncHandler(async (req, res) => {
  const data = await engagementService.unbookmarkPost(req.user?.userId, req.params.postId);
  res.status(200).json({
    success: true,
    message: data.removed ? 'Bookmark removed successfully!' : 'Post was not bookmarked.',
    data,
  });
});
