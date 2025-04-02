import { Request, Response } from 'express';
import { generateResponse } from '../services/text_generation';
import { generateImage } from '../services/image_generation';
import { CHARACTER_GENERATION_PROMPT, CHARACTER_SYSTEM_INSTRUCTION } from '../prompts/character';
import { IMAGE_GENERATION_PROMPT, IMAGE_SYSTEM_INSTRUCTION } from '../prompts/image';
import { Character } from '../types/character';

interface CharacterGenerationRequest {
    tags: string;
}

function parseGeneratedCharacter(content: string): Character {
    try {
        // First try to extract JSON from markdown code block if present
        const jsonString = content.includes('```')
            ? content.replace(/```json\n|\n```/g, '').trim()
            : content.trim();

        const parsedData = JSON.parse(jsonString);

        // Validate the required fields
        if (!parsedData.name || !parsedData.gender || !parsedData.description || !parsedData.bio || typeof parsedData.nsfw !== 'boolean') {
            throw new Error('Generated character data is missing required fields');
        }

        return {
            name: parsedData.name,
            gender: parsedData.gender,
            description: parsedData.description,
            bio: parsedData.bio,
            nsfw: parsedData.nsfw
        };
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to parse character data: ${error.message}`);
        }
        throw new Error('Failed to parse character data: Unknown error');
    }
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

        const model = "gemini-2.5-pro-exp-03-25";

        // Generate the response
        const generatedContent = await generateResponse(
            CHARACTER_GENERATION_PROMPT(tags),
            model,
            CHARACTER_SYSTEM_INSTRUCTION,
        );

        // Parse the generated content into our Character type
        const parsedCharacter = parseGeneratedCharacter(generatedContent);

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
        const model = "gemini-2.0-flash";

        // Generate image prompt using text generation
        const imgGenPrompt = await generateResponse(
            IMAGE_GENERATION_PROMPT([character], "social media avatar"),
            model,
            IMAGE_SYSTEM_INSTRUCTION,
        );

        // Use the generated prompt to create an image with Civitai and upload to Supabase
        const imageUrl = await generateImage({
            prompt: imgGenPrompt,
            bucketName: "character-avatars"
        });

        return res.status(200).json({
            success: true,
            content: {
                prompt: imgGenPrompt,
                imageUrl: imageUrl
            }
        });
    } catch (error: any) {
        console.error('Error generating avatar:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'An unexpected error occurred'
        });
    }
}
