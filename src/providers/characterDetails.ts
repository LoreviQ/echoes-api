import supabase from '../config/supabase';
import { wrapInCodeBlock } from '../utils/string';

/**
 * Fetches character details from the database and converts them to a JSON string.
 * @param character_id - The ID of the character to fetch.
 * @returns A promise containing the character details as a JSON string and any error that occurred.
 */
export async function characterDetailsProvider(character_id: string): Promise<{ character: string | null, error: any }> {
    // Get character details from supabase
    const { data, error } = await supabase
        .from('characters')
        .select('name, gender, description, bio, nsfw, appearance')
        .eq('id', character_id)
        .single();

    if (error || !data) {
        console.error('Error fetching character:', error);
        return { character: null, error };
    }
    // Convert the character data to a string and wrap in code block
    const character = wrapInCodeBlock(JSON.stringify(data, null, 2));
    return { character, error: null };
}