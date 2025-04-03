import supabase from '../config/supabase';
import { generateResponse } from './text_generation';
import { POST_GENERATION } from '../prompts/post';

/**
 * Generates a post for a specific character
 * @param characterId The ID of the character to generate a post for
 * @returns The created post data or null if an error occurred
 */
export const generatePostForCharacter = async (characterId: string) => {
    try {
        // Fetch character details
        const { data: character, error: characterError } = await supabase
            .from('characters')
            .select('*')
            .eq('id', characterId)
            .single();

        if (characterError || !character) {
            console.error('Error fetching character:', characterError);
            return null;
        }

        // Generate post content
        const model = "gemini-2.0-flash";
        const postContent = await generateResponse(
            POST_GENERATION.PROMPT(character),
            model,
            POST_GENERATION.SYSTEM,
        );

        // Create post in database
        const { data, error } = await supabase
            .from('posts')
            .insert({
                character_id: characterId,
                content: postContent.trim()
            })
            .select();

        if (error) {
            console.error('Error creating post:', error);
            return null;
        }

        return data ? data[0] : null;
    } catch (error) {
        console.error('Unexpected error generating post:', error);
        return null;
    }
}; 