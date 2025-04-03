import supabase from '../../config/supabase';
import { generateResponse } from './text';
import { generateImage } from './image';
import { POST_GENERATION } from '../../prompts/post';
import { CHARACTER_GENERATION } from '../../prompts/character';
import { IMAGE_GENERATION } from '../../prompts/image';
import { Character } from '../../types/character';

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

/**
 * Parses the AI-generated character data into a structured Character object
 */
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
 * Generates a character based on provided tags
 * @param tags Tags to describe the character to be generated
 * @returns The generated character or throws an error
 */
export const generateCharacterFromTags = async (tags: string): Promise<Character> => {
    if (!tags) {
        throw new Error('Tags are required');
    }

    const model = "gemini-2.0-flash";

    // Generate the response
    const generatedContent = await generateResponse(
        CHARACTER_GENERATION.PROMPT(tags),
        model,
        CHARACTER_GENERATION.SYSTEM,
    );

    // Parse the generated content into our Character type
    return parseGeneratedCharacter(generatedContent);
};

/**
 * Generates an avatar image for a character
 * @param character The character to generate an avatar for
 * @returns Object containing the prompt and image URL
 */
export const generateAvatarForCharacter = async (character: Character) => {
    const model = "gemini-2.0-flash";

    // Generate image prompt using text generation
    const imgGenPrompt = await generateResponse(
        IMAGE_GENERATION.PROMPT([character], "social media avatar"),
        model,
        IMAGE_GENERATION.SYSTEM,
    );

    // Use the generated prompt to create an image with Civitai and upload to Supabase
    const imageUrl = await generateImage({
        prompt: imgGenPrompt,
        bucketName: "character-avatars",
        nsfw: character.nsfw
    });

    return {
        prompt: imgGenPrompt,
        imageUrl: imageUrl
    };
};

/**
 * Generates a banner image for a character
 * @param character The character to generate a banner for
 * @returns Object containing the prompt and image URL
 */
export const generateBannerForCharacter = async (character: Character) => {
    const model = "gemini-2.0-flash";

    // Generate image prompt using text generation
    const imgGenPrompt = await generateResponse(
        IMAGE_GENERATION.PROMPT([character], "banner image"),
        model,
        IMAGE_GENERATION.SYSTEM,
    );

    // Use the generated prompt to create an image with specific dimensions
    const imageUrl = await generateImage({
        prompt: imgGenPrompt,
        bucketName: "character-banners",
        width: 1200,
        height: 400,
        nsfw: character.nsfw
    });

    return {
        prompt: imgGenPrompt,
        imageUrl: imageUrl
    };
}; 