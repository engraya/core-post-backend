import mongoose from 'mongoose';
import User from '../models/userModel';
import { AppError } from '../errors/AppError';
import { updateProfileSchema } from '../utils/validator';

/** First Joi error message, or a generic validation fallback. */
function validationMessage(error: { details: { message: string }[] } | undefined): string {
  return error?.details[0]?.message ?? 'Validation failed';
}

const postsPopulate = {
  path: 'posts' as const,
  options: { sort: { createdAt: -1 } as const },
};

/** Paginated users with their posts (virtual populate), newest users first. */
export async function listUsers(page?: string) {
  const per_page = 10;
  let page_number = 0;
  if (page && Number(page) > 1) {
    page_number = Number(page) - 1;
  }

  return User.find()
    .populate(postsPopulate)
    .sort({ createdAt: -1 })
    .skip(page_number * per_page)
    .limit(per_page);
}

/** Returns one user (with posts) or 400/404 for bad id / missing user. */
export async function getUserById(id: string) {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, 'Invalid user id.');
  }

  const user = await User.findById(id).populate(postsPopulate);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return user;
}

/** Patches `displayName` and/or `avatarUrl` (including clearing avatar) for the current user. */
export async function updateProfileForUser(userId: string | undefined, body: Record<string, unknown>) {
  if (!userId) {
    throw new AppError(401, 'User not authenticated.');
  }

  const { error, value } = updateProfileSchema.validate(body, { stripUnknown: true });
  if (error) {
    throw new AppError(400, validationMessage(error));
  }

  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  if (value.displayName !== undefined) {
    user.displayName = value.displayName;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'avatarUrl')) {
    if (value.avatarUrl === '' || value.avatarUrl === null) {
      user.set('avatarUrl', undefined);
    } else if (typeof value.avatarUrl === 'string') {
      user.avatarUrl = value.avatarUrl;
    }
  }

  await user.save();
  return user;
}
