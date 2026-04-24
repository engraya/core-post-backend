/** User API: public directory, single user, current profile, and saved posts. */
import express from 'express';
import * as userController from '../controllers/userController';
import { isAuthenticated } from '../middlewares/isAuthenticated';

const router = express.Router();

// Current user profile and bookmarks
router.patch('/me', isAuthenticated, userController.updateMyProfile);
router.get('/me/bookmarks', isAuthenticated, userController.myBookmarks);
// Public user directory
router.get('/', userController.allUsers);
router.get('/:id', userController.getSingleUser);

export default router;
