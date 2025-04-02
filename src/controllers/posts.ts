import { Request, Response } from 'express';
import supabase from '../config/supabase';
import { generateResponse } from '../services/text_generation';
import { POST_GENERATION } from '../prompts/post';

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

        // fetch character details
        const { data: character, error: characterError } = await supabase
            .from('characters')
            .select('*')
            .eq('id', character_id)
            .single();

        // generate post content
        const model = "gemini-2.0-flash";
        const postContent = await generateResponse(
            POST_GENERATION.PROMPT(character),
            model,
            POST_GENERATION.SYSTEM,
        );

        // Create post with "hello world" content
        const { data, error } = await supabase
            .from('posts')
            .insert({
                character_id,
                content: postContent.trim()
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