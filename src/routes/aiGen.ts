import express, { Router } from 'express';
import { generateContent, generateCharacter } from '../controllers/aiGen';

const router: Router = express.Router();

// POST /generations - Create a new content generation
router.post('/', generateContent);

// POST /generations/character - Create a character based on tags
router.post('/character', generateCharacter);

export default router; 