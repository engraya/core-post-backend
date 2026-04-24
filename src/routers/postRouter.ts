/**
 * Post API: feed, single post, CRUD, comments, likes, and bookmarks. Route order matters
 * for `/likes`, `/comments`, etc. vs `/:_id`.
 */
import express from 'express';
import * as postController from '../controllers/postController';
import * as commentController from '../controllers/commentController';
import * as engagementController from '../controllers/engagementController';
import { isAuthenticated } from '../middlewares/isAuthenticated';
import { isVerified } from '../middlewares/isVerified';
import { optionalAuthenticated } from '../middlewares/optionalAuthenticated';

const router = express.Router();

// Post feed
router.get('/', postController.allPosts);

// Likes and bookmarks (must be registered before `/:_id` to avoid param shadowing)
router.get('/:postId/likes/count', engagementController.getLikeCount);
router.post('/:postId/like', isAuthenticated, isVerified, engagementController.likePost);
router.delete('/:postId/like', isAuthenticated, isVerified, engagementController.unlikePost);
router.post('/:postId/bookmark', isAuthenticated, isVerified, engagementController.bookmarkPost);
router.delete('/:postId/bookmark', isAuthenticated, isVerified, engagementController.unbookmarkPost);

// Comments
router.get('/:postId/comments', commentController.listComments);
router.post('/:postId/comments', isAuthenticated, isVerified, commentController.createComment);
router.patch('/:postId/comments/:commentId', isAuthenticated, isVerified, commentController.updateComment);
router.delete('/:postId/comments/:commentId', isAuthenticated, isVerified, commentController.deleteComment);

// Single post (optional JWT enriches response) and author-only CRUD
router.get('/:_id', optionalAuthenticated, postController.getSinglePost);
router.post('/create', isAuthenticated, isVerified, postController.createPost);
router.put('/update/:_id', isAuthenticated, isVerified, postController.updatePost);
router.delete('/delete/:_id', isAuthenticated, isVerified, postController.deletePost);

export default router;
