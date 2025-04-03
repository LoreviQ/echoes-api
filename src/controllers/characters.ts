import { Request, Response } from 'express';
import { generateCharacterFromTags, generateAvatarForCharacter, generateBannerForCharacter } from '../services/ai_generation/content';
import { Character } from '../types/character';

interface CharacterGenerationRequest {
    tags: string;
}

/**
 * Generate character based on tags
 */
export const generateCharacter = async (req: Request, res: Response): Promise<any> => {
    try {
        const { tags } = req.body as CharacterGenerationRequest;

        // Validate required fields
        if (!tags) {
            return res.status(400).json({ error: 'Tags are required' });
        }

        // Generate character using the service function
        const parsedCharacter = await generateCharacterFromTags(tags);

        return res.status(200).json({
            success: true,
            content: parsedCharacter
        });
    } catch (error: any) {
        console.error('Error generating character:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'An unexpected error occurred'
        });
    }
};

/**
 * Generate avatar based on character
 */
export const generateAvatar = async (req: Request, res: Response): Promise<any> => {
    try {
        const character = req.body as Character;

        // Generate avatar using the service function
        const result = await generateAvatarForCharacter(character);

        return res.status(200).json({
            success: true,
            content: result
        });
    } catch (error: any) {
        console.error('Error generating avatar:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'An unexpected error occurred'
        });
    }
}

/**
 * Generate banner based on character
 */
export const generateBanner = async (req: Request, res: Response): Promise<any> => {
    try {
        const character = req.body as Character;

        // Generate banner using the service function
        const result = await generateBannerForCharacter(character);

        return res.status(200).json({
            success: true,
            content: result
        });
    } catch (error: any) {
        console.error('Error generating banner:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'An unexpected error occurred'
        });
    }
}
