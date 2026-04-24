import { asyncHandler } from '../middlewares/asyncHandler';
import * as userService from '../services/userService';
import * as engagementService from '../services/engagementService';

/** Paginated list of users with their posts populated. */
export const allUsers = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query.page as string | undefined);
  res.status(200).json({
    success: true,
    message: 'User data retrieved successfully!',
    data: result,
  });
});

/** Returns one user by id with associated posts. */
export const getSingleUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json({
    success: true,
    message: 'User retrieved successfully!',
    data: user,
  });
});

/** Updates the signed-in user’s display name and/or avatar URL. */
export const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfileForUser(req.user?.userId, req.body);
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully!',
    data: user,
  });
});

/** Paginated list of the current user’s saved posts. */
export const myBookmarks = asyncHandler(async (req, res) => {
  const data = await engagementService.listMyBookmarks(
    req.user?.userId,
    req.query.page as string | undefined,
  );
  res.status(200).json({
    success: true,
    message: 'Bookmarks retrieved successfully!',
    data,
  });
});
