import express from 'express';
const postController = require('../controllers/postController')
const router = express.Router();
import { isAuthenticated } from '../middlewares/isAuthenticated';


router.get('/', postController.allPosts);
router.get('/:_id', postController.getSinglePost);
router.post('/create', isAuthenticated, postController.createPost);
router.put('/update/:_id',  isAuthenticated, postController.updatePost);
router.delete('/delete/:_id',  isAuthenticated, postController.deletePost);



module.exports = router