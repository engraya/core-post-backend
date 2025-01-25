"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postController = require('../controllers/postController');
const router = express_1.default.Router();
const isAuthenticated_1 = require("../middlewares/isAuthenticated");
router.get('/', postController.allPosts);
router.get('/:_id', postController.getSinglePost);
router.post('/create', isAuthenticated_1.isAuthenticated, postController.createPost);
router.put('/update/:_id', isAuthenticated_1.isAuthenticated, postController.updatePost);
router.delete('/delete/:_id', isAuthenticated_1.isAuthenticated, postController.deletePost);
module.exports = router;
