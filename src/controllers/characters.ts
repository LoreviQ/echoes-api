import { Request, Response } from 'express';

import { generateCharacterFromTags, generateAvatarForCharacter, generateBannerForCharacter, generateCharacterAttributesForCharacter } from '@/services/ai_generation';
import type { GeneratedCharacter } from 'echoes-shared';

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
        // generate attributes
        const attributes = await generateCharacterAttributesForCharacter(parsedCharacter);

        return res.status(200).json({
            success: true,
            content: {
                character: parsedCharacter,
                attributes: attributes
            }
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
        const character = req.body as GeneratedCharacter;

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
        const character = req.body as GeneratedCharacter;

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

/**
 * Generate attributes based on character
 */
export const generateCharacterAttributes = async (req: Request, res: Response): Promise<any> => {
    try {
        const character = req.body as GeneratedCharacter;

        // Generate attributes using the service function
        const result = await generateCharacterAttributesForCharacter(character);

        return res.status(200).json({
            success: true,
            content: result
        });
    } catch (error: any) {
        console.error('Error generating character attributes:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'An unexpected error occurred'
        });
    }
}