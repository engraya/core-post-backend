import mongoose from 'mongoose';
import User from '../models/userModel';
import { AppError } from '../errors/AppError';

const postsPopulate = {
  path: 'posts' as const,
  options: { sort: { createdAt: -1 } as const },
};

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
