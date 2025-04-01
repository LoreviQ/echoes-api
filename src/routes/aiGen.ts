import express, { Router } from 'express';
import { generateCharacter } from '../controllers/aiGen';

const router: Router = express.Router();

// POST /generations/character - Create a character based on tags
router.post('/character', generateCharacter);

export default router; 