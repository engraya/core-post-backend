import { asyncHandler } from '../middlewares/asyncHandler';
import * as commentService from '../services/commentService';

/** Paginated comments for a post (`userId` only, no user document). */
export const listComments = asyncHandler(async (req, res) => {
  const result = await commentService.listCommentsForPost(
    req.params.postId,
    req.query.page as string | undefined,
  );
  res.status(200).json({
    success: true,
    message: 'Comments retrieved successfully!',
    data: result,
  });
});

/** Adds a comment on a post as the authenticated user. */
export const createComment = asyncHandler(async (req, res) => {
  const comment = await commentService.createCommentForPost(req.user?.userId, req.params.postId, req.body);
  res.status(201).json({
    success: true,
    message: 'Comment created successfully!',
    data: comment,
  });
});

/** Updates a comment only if the current user is its author. */
export const updateComment = asyncHandler(async (req, res) => {
  const comment = await commentService.updateCommentForAuthor(
    req.user?.userId,
    req.params.postId,
    req.params.commentId,
    req.body,
  );
  res.status(200).json({
    success: true,
    message: 'Comment updated successfully!',
    data: comment,
  });
});

/** Deletes a comment only if the current user is its author. */
export const deleteComment = asyncHandler(async (req, res) => {
  await commentService.deleteCommentForAuthor(
    req.user?.userId,
    req.params.postId,
    req.params.commentId,
  );
  res.status(200).json({
    success: true,
    message: 'Comment deleted successfully!',
  });
});
