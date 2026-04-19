import { asyncHandler } from '../middlewares/asyncHandler';
import * as userService from '../services/userService';

export const allUsers = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query.page as string | undefined);
  res.status(200).json({
    success: true,
    message: 'User data retrieved successfully!',
    data: result,
  });
});

export const getSingleUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json({
    success: true,
    message: 'User retrieved successfully!',
    data: user,
  });
});
