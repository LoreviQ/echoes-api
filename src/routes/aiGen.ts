import express, { Router } from 'express';
import { generateContent } from '../controllers/aiGen';

const router: Router = express.Router();

// POST /generations - Create a new content generation
router.post('/', generateContent);

export default router; 