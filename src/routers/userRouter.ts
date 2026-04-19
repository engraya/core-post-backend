import express from 'express';
import * as userController from '../controllers/userController';

const router = express.Router();

router.get('/', userController.allUsers);
router.get('/:id', userController.getSingleUser);

export default router;
