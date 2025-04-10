import { Request, Response } from 'express';

import { generatePostForCharacter } from '@/services/ai_generation/content';

/**
 * Create a new post for a character
 */
export const createPost = async (req: Request, res: Response): Promise<any> => {
    try {
        const { character_id } = req.params;

        // Check if character_id is valid
        if (!character_id) {
            return res.status(400).json({ error: 'Character ID is required' });
        }

        // Generate post using the shared function
        const post = await generatePostForCharacter(character_id);

        if (!post) {
            return res.status(500).json({ error: 'Failed to create post' });
        }

        return res.status(201).json({
            message: 'Post created successfully',
            post
        });
    } catch (error) {
        console.error('Unexpected error creating post:', error);
        return res.status(500).json({
            error: 'An unexpected error occurred'
        });
    }
}; 