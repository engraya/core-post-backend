import mongoose from 'mongoose';
import Comment from '../models/commentModel';
import Post from '../models/postModel';
import { AppError } from '../errors/AppError';
import { createCommentSchema, updateCommentSchema } from '../utils/validator';

/** First Joi error message, or a generic validation fallback. */
function validationMessage(error: { details: { message: string }[] } | undefined): string {
  return error?.details[0]?.message ?? 'Validation failed';
}

const authorPopulate = {
  path: 'userId' as const,
  select: 'displayName avatarUrl email' as const,
};

/** Rejects the request with 400 if `id` is not a valid ObjectId string. */
function assertValidObjectId(id: string, message: string) {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, message);
  }
}

/** Ensures the target post exists or throws 404. */
async function assertPostExists(postId: string) {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError(404, 'Post not found');
  }
}

/** Paginated, newest-first comments for a post with author fields populated. */
export async function listCommentsForPost(postId: string, page?: string) {
  assertValidObjectId(postId, 'Invalid post id.');
  await assertPostExists(postId);

  const per_page = 10;
  let page_number = 0;
  if (page && Number(page) > 1) {
    page_number = Number(page) - 1;
  }

  return Comment.find({ postId })
    .sort({ createdAt: -1 })
    .skip(page_number * per_page)
    .limit(per_page)
    .populate(authorPopulate);
}

/** Inserts a comment and returns the saved row with author populate. */
export async function createCommentForPost(
  userId: string | undefined,
  postId: string,
  body: { body?: string },
) {
  if (!userId) {
    throw new AppError(401, 'User not authenticated.');
  }

  assertValidObjectId(postId, 'Invalid post id.');
  await assertPostExists(postId);

  const { error, value } = createCommentSchema.validate(body);
  if (error) {
    throw new AppError(400, validationMessage(error));
  }

  const comment = await Comment.create({
    postId,
    userId,
    body: value.body,
  });

  return Comment.findById(comment._id).populate(authorPopulate);
}

/** Edits a comment’s body if it belongs to the user on the given post. */
export async function updateCommentForAuthor(
  userId: string | undefined,
  postId: string,
  commentId: string,
  body: { body?: string },
) {
  if (!userId) {
    throw new AppError(401, 'User not authenticated.');
  }

  assertValidObjectId(postId, 'Invalid post id.');
  assertValidObjectId(commentId, 'Invalid comment id.');
  await assertPostExists(postId);

  const { error, value } = updateCommentSchema.validate(body);
  if (error) {
    throw new AppError(400, validationMessage(error));
  }

  const updated = await Comment.findOneAndUpdate(
    { _id: commentId, postId, userId },
    { body: value.body },
    { new: true },
  ).populate(authorPopulate);

  if (!updated) {
    throw new AppError(404, 'Comment not found or you do not have permission to edit it.');
  }

  return updated;
}

/** Hard-deletes a comment if the user authored it on that post. */
export async function deleteCommentForAuthor(userId: string | undefined, postId: string, commentId: string) {
  if (!userId) {
    throw new AppError(401, 'User not authenticated.');
  }

  assertValidObjectId(postId, 'Invalid post id.');
  assertValidObjectId(commentId, 'Invalid comment id.');
  await assertPostExists(postId);

  const deleted = await Comment.findOneAndDelete({ _id: commentId, postId, userId });
  if (!deleted) {
    throw new AppError(404, 'Comment not found or you do not have permission to delete it.');
  }
}

/** Used when a post is deleted: removes all its comments. */
export async function deleteCommentsByPostId(postId: mongoose.Types.ObjectId | string) {
  await Comment.deleteMany({ postId });
}
