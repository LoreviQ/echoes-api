import express, { Router } from 'express';
import { generateAvatar, generateCharacter, generateBanner, generateCharacterAttributes } from '../controllers/characters';

const router: Router = express.Router();

// POST /generations/character - Create a character based on tags
router.post('/character', generateCharacter);
router.post('/character/avatar', generateAvatar);
router.post('/character/banner', generateBanner);
router.post('/character/attributes', generateCharacterAttributes);

export default router; 