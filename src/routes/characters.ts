import express, { Router } from 'express';
import { createPost } from '@/controllers/posts';

const router: Router = express.Router();

// POST /characters/:character_id/posts - Create a new post for a character
router.post('/:character_id/posts', createPost);

export default router; 