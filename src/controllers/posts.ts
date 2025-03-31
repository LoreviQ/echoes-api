import { Request, Response } from 'express';
import supabase from '../config/supabase';

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

        // Create post with "hello world" content
        const { data, error } = await supabase
            .from('posts')
            .insert({
                character_id,
                content: 'hello world'
            })
            .select();

        if (error) {
            console.error('Error creating post:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(201).json({
            message: 'Post created successfully',
            post: data ? data[0] : null
        });
    } catch (error) {
        console.error('Unexpected error creating post:', error);
        return res.status(500).json({
            error: 'An unexpected error occurred'
        });
    }
}; 