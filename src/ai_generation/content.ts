import type { GeneratedCharacter, CharacterAttributes } from 'echoes-shared';

import supabase, { SUPABASE_CONFIG } from '@/config/supabase';
import { generateResponse } from './text';
import { generateImage } from './image';
import { POST_GENERATION, CHARACTER_GENERATION, CHARACTER_ATTRIBUTES, IMAGE_GENERATION, MESSAGE_REPLY } from '@/ai_generation/context_builder/prompts';
import { builder } from '@/ai_generation/context_builder';
import { characterDetailsProvider, messageHistoryProvider, providedCharacterProvider } from '@/ai_generation/context_builder/providers';
import { tagsProvider } from './context_builder/providers/tags';
import { database } from '@/config/cachedDatabase';
import { database as databaseActual } from 'echoes-shared';

/**
 * Generates a post for a specific character
 * @param characterId The ID of the character to generate a post for
 * @returns The created post data or null if an error occurred
 */
export const generatePostForCharacter = async (characterId: string) => {
    try {
        // Generate post content
        const model = "gemini-2.0-flash";
        const contextBuilder = builder(POST_GENERATION, {
            endPromptString: "**OUTPUT**"
        });
        contextBuilder.addProvider(characterDetailsProvider(characterId));

        const postContent = await generateResponse(
            await contextBuilder.prompt(),
            model,
            await contextBuilder.system()
        );

        // Create post in database
        const { post, error } = await databaseActual.createPost({ character_id: characterId, content: postContent.trim() }, supabase);

        if (error) {
            console.error('Error creating post:', error);
            return null;
        }

        return post;
    } catch (error) {
        console.error('Unexpected error generating post:', error);
        return null;
    }
};

/**
 * Parses the AI-generated character data into a structured Character object
 */
function parseGeneratedCharacter(content: string): GeneratedCharacter {
    try {
        // First try to extract JSON from markdown code block if present
        const jsonString = content.includes('```')
            ? content.replace(/```json\n|\n```/g, '').trim()
            : content.trim();

        const parsedData = JSON.parse(jsonString);

        // Validate the required fields
        if (!parsedData.name || !parsedData.gender || typeof parsedData.nsfw !== 'boolean') {
            throw new Error('Generated character data is missing required fields');
        }

        return {
            name: parsedData.name,
            gender: parsedData.gender,
            description: parsedData.description,
            bio: parsedData.bio,
            nsfw: parsedData.nsfw,
            appearance: parsedData.appearance
        };
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to parse character data: ${error.message}`);
        }
        throw new Error('Failed to parse character data: Unknown error');
    }
}

/**
 * Parses the AI-generated attributes data into a structured CharacterAttributes object
 */
function parseGeneratedAttributes(content: string): CharacterAttributes {
    try {
        // First try to extract JSON from markdown code block if present
        const jsonString = content.includes('```')
            ? content.replace(/```json\n|\n```/g, '').trim()
            : content.trim();

        const parsedData = JSON.parse(jsonString);

        // List of required fields and their expected types
        const requiredFields = {
            mood: 'string',
            goal: 'string',
            posting_frequency: 'number',
            originality: 'number',
            like_reply_ratio: 'number',
            responsiveness: 'number',
            reading_scope: 'number',
            information_filtering: 'number',
            sentiment_filtering: 'number',
            profile_scrutiny: 'number',
            influencability: 'number',
            engagement_sensitivity: 'number',
            relationship_formation_speed: 'number',
            relationship_closeness_threshold: 'number',
            relationship_stability: 'number',
            grudge_persistence: 'number',
            positivity: 'number',
            openness: 'number',
            formality: 'number',
            conflict_initiation: 'number',
            influence_seeking: 'number',
            inquisitiveness: 'number',
            humor: 'number',
            depth: 'number'
        } as const;

        // Validate all required fields exist and have correct types
        for (const [field, expectedType] of Object.entries(requiredFields)) {
            if (!(field in parsedData)) {
                throw new Error(`Missing required field: ${field}`);
            }

            const value = parsedData[field];
            if (typeof value !== expectedType) {
                throw new Error(`Field ${field} must be a ${expectedType}`);
            }

            // Validate number ranges
            if (expectedType === 'number' && (value < -100 || value > 100)) {
                throw new Error(`Field ${field} must be between -100 and 100`);
            }
        }

        return parsedData as CharacterAttributes;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to parse character attributes: ${error.message}`);
        }
        throw new Error('Failed to parse character attributes: Unknown error');
    }
}

/**
 * Generates a character based on provided tags
 * @param tags Tags to describe the character to be generated
 * @returns The generated character or throws an error
 */
export const generateCharacterFromTags = async (tags: string): Promise<GeneratedCharacter> => {
    if (!tags) {
        throw new Error('Tags are required');
    }

    const model = "gemini-2.0-flash";
    const contextBuilder = builder(CHARACTER_GENERATION, {
        endPromptString: "**OUTPUT**"
    });
    contextBuilder.addProvider(tagsProvider(tags));

    // Generate the response
    const generatedContent = await generateResponse(
        await contextBuilder.prompt(),
        model,
        await contextBuilder.system()
    );

    // Parse the generated content into our Character type
    return parseGeneratedCharacter(generatedContent);
};

/**
 * Generates an avatar image for a character
 * @param character The character to generate an avatar for
 * @returns Object containing the prompt and image URL
 */
export const generateAvatarForCharacter = async (character: GeneratedCharacter) => {
    const model = "gemini-2.0-flash";
    const contextBuilder = builder(IMAGE_GENERATION, {
        endPromptString: "**OUTPUT**"
    });
    contextBuilder.addProvider(providedCharacterProvider(character));

    // Generate image prompt using text generation
    const imgGenPrompt = await generateResponse(
        await contextBuilder.prompt(),
        model,
        await contextBuilder.system()
    );

    // Use the generated prompt to create an image with Civitai and upload to Supabase
    const imageUrl = await generateImage({
        prompt: imgGenPrompt,
        bucketName: SUPABASE_CONFIG.AVATAR_BUCKET,
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
export const generateBannerForCharacter = async (character: GeneratedCharacter) => {
    const model = "gemini-2.0-flash";
    const contextBuilder = builder(IMAGE_GENERATION, {
        endPromptString: "**OUTPUT**"
    });
    contextBuilder.addProvider(providedCharacterProvider(character));

    // Generate image prompt using text generation
    const imgGenPrompt = await generateResponse(
        await contextBuilder.prompt(),
        model,
        await contextBuilder.system()
    );

    // Use the generated prompt to create an image with specific dimensions
    const imageUrl = await generateImage({
        prompt: imgGenPrompt,
        bucketName: SUPABASE_CONFIG.BANNER_BUCKET,
        width: 1200,
        height: 400,
        nsfw: character.nsfw
    });

    return {
        prompt: imgGenPrompt,
        imageUrl: imageUrl
    };
};

/**
 * Generates a response message from a character to a user message
 * @param threadId The thread ID the message belongs to
 * @returns Generated character response content or null if an error occurred
 */
export const generateMessageResponse = async (threadId: string): Promise<string | null> => {
    try {

        const { thread, error: threadError } = await database.getThread(threadId, supabase);
        if (threadError || !thread) {
            console.error('Error fetching thread:', threadError);
            return null;
        }


        // Build the prompt
        const contextBuilder = builder(MESSAGE_REPLY);
        contextBuilder.addProvider(characterDetailsProvider(thread.character_id));
        contextBuilder.addProvider(messageHistoryProvider(threadId));


        // Generate the response
        const generatedResponse = await generateResponse(
            await contextBuilder.prompt(),
            "gemini-2.0-flash",
            await contextBuilder.system()
        );

        return generatedResponse;
    } catch (error) {
        console.error('Error generating message response:', error);
        return null;
    }
};

/**
 * Generates attributes for a character
 * @param character The character to generate attributes for
 * @returns Generated and parsed character attributes or throws an error
 */
export const generateCharacterAttributesForCharacter = async (character: GeneratedCharacter): Promise<CharacterAttributes> => {
    const model = "gemini-2.0-flash";
    const contextBuilder = builder(CHARACTER_ATTRIBUTES, {
        endPromptString: "**OUTPUT**"
    });
    contextBuilder.addProvider(providedCharacterProvider(character));

    const generatedContent = await generateResponse(
        await contextBuilder.prompt(),
        model,
        await contextBuilder.system()
    );

    return parseGeneratedAttributes(generatedContent);
};