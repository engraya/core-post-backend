import mongoose from 'mongoose';
import Post from '../models/postModel';
import PostLike from '../models/postLikeModel';
import PostBookmark from '../models/postBookmarkModel';
import { AppError } from '../errors/AppError';

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

/** Total likes for a post (public, post must exist). */
export async function getLikeCount(postId: string) {
  assertValidObjectId(postId, 'Invalid post id.');
  await assertPostExists(postId);
  const count = await PostLike.countDocuments({ postId });
  return { count };
}

/** Creates a like document; duplicate key is treated as already liked. */
export async function likePost(userId: string | undefined, postId: string) {
  if (!userId) {
    throw new AppError(401, 'User not authenticated.');
  }
  assertValidObjectId(postId, 'Invalid post id.');
  await assertPostExists(postId);
  try {
    await PostLike.create({ userId, postId });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: number }).code === 11000) {
      return { liked: true, alreadyLiked: true };
    }
    throw err;
  }
  return { liked: true, alreadyLiked: false };
}

/** Removes the like row; reports whether a row was deleted. */
export async function unlikePost(userId: string | undefined, postId: string) {
  if (!userId) {
    throw new AppError(401, 'User not authenticated.');
  }
  assertValidObjectId(postId, 'Invalid post id.');
  await assertPostExists(postId);
  const result = await PostLike.findOneAndDelete({ userId, postId });
  return { liked: false, removed: Boolean(result) };
}

/** Creates a bookmark; duplicate key is treated as already saved. */
export async function bookmarkPost(userId: string | undefined, postId: string) {
  if (!userId) {
    throw new AppError(401, 'User not authenticated.');
  }
  assertValidObjectId(postId, 'Invalid post id.');
  await assertPostExists(postId);
  try {
    await PostBookmark.create({ userId, postId });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: number }).code === 11000) {
      return { bookmarked: true, alreadyBookmarked: true };
    }
    throw err;
  }
  return { bookmarked: true, alreadyBookmarked: false };
}

/** Removes the bookmark row; reports whether a row was deleted. */
export async function unbookmarkPost(userId: string | undefined, postId: string) {
  if (!userId) {
    throw new AppError(401, 'User not authenticated.');
  }
  assertValidObjectId(postId, 'Invalid post id.');
  await assertPostExists(postId);
  const result = await PostBookmark.findOneAndDelete({ userId, postId });
  return { bookmarked: false, removed: Boolean(result) };
}

const perPage = 10;

/** Paginated saved posts for the current user, posts populated. */
export async function listMyBookmarks(userId: string | undefined, page?: string) {
  if (!userId) {
    throw new AppError(401, 'User not authenticated.');
  }

  let page_number = 0;
  if (page && Number(page) > 1) {
    page_number = Number(page) - 1;
  }

  const bookmarks = await PostBookmark.find({ userId })
    .sort({ createdAt: -1 })
    .skip(page_number * perPage)
    .limit(perPage)
    .populate({ path: 'postId', model: 'Post' });

  return bookmarks;
}

/** Bulk-delete likes when a post is removed. */
export async function deleteLikesByPostId(postId: mongoose.Types.ObjectId | string) {
  await PostLike.deleteMany({ postId });
}

/** Bulk-delete bookmarks when a post is removed. */
export async function deleteBookmarksByPostId(postId: mongoose.Types.ObjectId | string) {
  await PostBookmark.deleteMany({ postId });
}

/** Aggregated counts and booleans for the single-post read path (public or optional user). */
export async function getEngagementFlagsForViewer(postId: string, viewerUserId?: string) {
  assertValidObjectId(postId, 'Invalid post id.');

  const [likeCount, bookmarkCount] = await Promise.all([
    PostLike.countDocuments({ postId }),
    PostBookmark.countDocuments({ postId }),
  ]);

  if (!viewerUserId) {
    return { likeCount, bookmarkCount, likedByMe: false, bookmarkedByMe: false };
  }

  const [likedByMe, bookmarkedByMe] = await Promise.all([
    PostLike.exists({ postId, userId: viewerUserId }),
    PostBookmark.exists({ postId, userId: viewerUserId }),
  ]);

  return {
    likeCount,
    bookmarkCount,
    likedByMe: Boolean(likedByMe),
    bookmarkedByMe: Boolean(bookmarkedByMe),
  };
}
