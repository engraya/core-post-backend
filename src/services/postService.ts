import Post from '../models/postModel';
import { AppError } from '../errors/AppError';
import { createPostSchema, updatePostSchema } from '../utils/validator';

function validationMessage(error: { details: { message: string }[] } | undefined): string {
  return error?.details[0]?.message ?? 'Validation failed';
}

export async function listPosts(page?: string) {
  const per_page = 10;
  let page_number = 0;
  if (page && Number(page) > 1) {
    page_number = Number(page) - 1;
  }

  return Post.find()
    .sort({ createdAt: -1 })
    .skip(page_number * per_page)
    .limit(per_page)
}

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

export async function getSinglePost(postId: string) {
  const post = await Post.findById(postId)
  if (!post) {
    throw new AppError(404, 'Post not found');
  }
  return post;
}

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

export async function deletePostForOwner(userId: string | undefined, postId: string) {
  if (!userId) {
    throw new AppError(401, 'User not authenticated.');
  }

  const deletedPost = await Post.findOneAndDelete({ _id: postId, userId });
  if (!deletedPost) {
    throw new AppError(404, 'Post not found or you do not have permission to delete it.');
  }
}
