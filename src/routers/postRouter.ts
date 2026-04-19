import express from 'express';
import * as postController from '../controllers/postController';
import { isAuthenticated } from '../middlewares/isAuthenticated';
import { isVerified } from '../middlewares/isVerified';

const router = express.Router();

router.get('/', postController.allPosts);
router.get('/:_id', postController.getSinglePost);
router.post('/create', isAuthenticated, isVerified, postController.createPost);
router.put('/update/:_id', isAuthenticated, isVerified, postController.updatePost);
router.delete('/delete/:_id', isAuthenticated, isVerified, postController.deletePost);

export default router;
