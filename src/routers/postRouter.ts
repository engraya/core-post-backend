import express from 'express';
import * as postController from '../controllers/postController';
import { isAuthenticated } from '../middlewares/isAuthenticated';

const router = express.Router();

router.get('/', postController.allPosts);
router.get('/:_id', postController.getSinglePost);
router.post('/create', isAuthenticated, postController.createPost);
router.put('/update/:_id', isAuthenticated, postController.updatePost);
router.delete('/delete/:_id', isAuthenticated, postController.deletePost);

export default router;
