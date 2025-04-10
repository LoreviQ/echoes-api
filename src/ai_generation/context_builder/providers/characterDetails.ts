import supabase from '@/config/supabase';
import { wrapInCodeBlock } from '@/utils/string';
import { Provider } from '../index';

/**
 * Fetches character details from the database and converts them to a JSON string.
 * @param character_id - The ID of the character to fetch.
 * @returns A Provider object that can be added to the ContextBuilder.
 */
export function characterDetailsProvider(character_id: string): Provider {
    return {
        title: 'Character Details',
        type: 'prompt',
        execute: async () => {
            // Get character details from supabase
            const { data, error } = await supabase
                .from('characters')
                .select('name, gender, description, bio, nsfw, appearance')
                .eq('id', character_id)
                .single();

            if (error || !data) {
                console.error('Error fetching character:', error);
                throw error;
            }

            // Convert the character data to a string and wrap in code block
            return wrapInCodeBlock(JSON.stringify(data, null, 2));
        }
    };
}