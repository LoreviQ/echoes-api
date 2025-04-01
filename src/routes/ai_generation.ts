import express, { Router } from 'express';
import { generateAvatar, generateCharacter } from '../controllers/characters';

const router: Router = express.Router();

// POST /generations/character - Create a character based on tags
router.post('/character', generateCharacter);
router.post('/character/avatar', generateAvatar);

export default router; 