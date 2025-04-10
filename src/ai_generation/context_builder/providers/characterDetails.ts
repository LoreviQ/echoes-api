import supabase from '@/config/supabase';
import { wrapInCodeBlock } from '@/utils/string';
import { Provider } from '@/ai_generation/context_builder';
import { GeneratedCharacter } from 'echoes-shared';
import { database } from '@/config/cachedDatabase';

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
            const { character, error } = await database.getCharacter(character_id, supabase);
            if (error || !character) {
                console.error('Error fetching character:', error);
                throw error;
            }

            // Create an object with only the fields from GeneratedCharacter
            const generatedCharacterData: GeneratedCharacter = {
                name: character.name,
                gender: character.gender,
                description: character.description,
                bio: character.bio,
                nsfw: character.nsfw,
                appearance: character.appearance,
            };

            // Convert the filtered character data to a string and wrap in code block
            return wrapInCodeBlock(JSON.stringify(generatedCharacterData, null, 2));
        }
    };
}

/**
 * Provider for a provided character instead of fetching from the database.
 * @param character - The character to use.
 * @returns A Provider object that can be added to the ContextBuilder.
 */
export function providedCharacterProvider(character: GeneratedCharacter): Provider {
    return {
        title: 'Character Details',
        type: 'prompt',
        execute: async () => {
            return wrapInCodeBlock(JSON.stringify(character, null, 2));
        }
    };
}