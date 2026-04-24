import Post from '../models/postModel';
import { AppError } from '../errors/AppError';
import { createPostSchema, updatePostSchema } from '../utils/validator';
import * as engagementService from './engagementService';
import * as commentService from './commentService';

/** First Joi error message, or a generic validation fallback. */
function validationMessage(error: { details: { message: string }[] } | undefined): string {
  return error?.details[0]?.message ?? 'Validation failed';
}

/** Paginated feed of posts, newest first (fixed page size). */
export async function listPosts(page?: string) {
  const per_page = 10;
  let page_number = 0;
  if (page && Number(page) > 1) {
    page_number = Number(page) - 1;
  }

  return Post.find()
    .sort({ createdAt: -1 })
    .skip(page_number * per_page)
    .limit(per_page);
}

/** Creates a new post document tied to the given user. */
export async function createPostForUser(
  userId: string | undefined,
  body: { title?: string; description?: string },
) {
  if (!userId) {
    throw new AppError(401, 'User not authenticated.');
  }

  const { error, value } = createPostSchema.validate({ ...body, userId });
  if (error) {
    throw new AppError(400, validationMessage(error));
  }

  return Post.create({
    title: value.title,
    description: value.description,
    userId: value.userId,
  });
}

/** Loads a post and merges public engagement counts and optional per-viewer flags. */
export async function getSinglePost(postId: string, viewerUserId?: string) {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError(404, 'Post not found');
  }
  const engagement = await engagementService.getEngagementFlagsForViewer(postId, viewerUserId);
  return { ...post.toObject(), ...engagement };
}

/** Updates title/body for a post the user owns. */
export async function updatePostForOwner(
  userId: string | undefined,
  postId: string,
  body: { title?: string; description?: string },
) {
  if (!userId) {
    throw new AppError(401, 'User not authenticated.');
  }

  const { error, value } = updatePostSchema.validate(body);
  if (error) {
    throw new AppError(400, validationMessage(error));
  }

  const updatedPost = await Post.findOneAndUpdate(
    { _id: postId, userId },
    { title: value.title, description: value.description },
    { new: true },
  );

  if (!updatedPost) {
    throw new AppError(404, 'Post not found or you do not have permission to edit it.');
  }

  return updatedPost;
}

/** Removes the post if owned, then cleans up comments, likes, and bookmarks. */
export async function deletePostForOwner(userId: string | undefined, postId: string) {
  if (!userId) {
    throw new AppError(401, 'User not authenticated.');
  }

  const deletedPost = await Post.findOneAndDelete({ _id: postId, userId });
  if (!deletedPost) {
    throw new AppError(404, 'Post not found or you do not have permission to delete it.');
  }

  const id = deletedPost._id as import('mongoose').Types.ObjectId;
  await Promise.all([
    commentService.deleteCommentsByPostId(id),
    engagementService.deleteLikesByPostId(id),
    engagementService.deleteBookmarksByPostId(id),
  ]);
}
