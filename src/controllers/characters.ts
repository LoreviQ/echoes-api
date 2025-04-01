import { Request, Response } from 'express';
import { generateResponse } from '../services/ai_generation';

interface CharacterGenerationRequest {
    tags: string;
}

interface Character {
    name: string;
    gender: string;
    description: string;
    bio: string;
    nsfw: boolean;
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
        const prompt = `Generate a character name and biography based on the following ten words:
${tags}
Remember to provide the output strictly in the specified JSON format: {"name": "character name", "description": "2-3 paragraph description here", "bio": "200 character social media bio", "gender": "character gender", "nsfw": boolean}.`;

        const systemInstruction = `You are an expert character creator and writer. Your task is to generate a character name and biography based on a list of ten descriptive words provided by the user.
You MUST analyze the provided words, even if they seem contradictory, and synthesize them into a coherent and intriguing character concept. 
The character concept can contain adult or mature themes if the words suggest it, however it must be clearly marked as such with the key "nsfw" set to true.

The output MUST be a single, valid JSON object. This JSON object must contain exactly four keys:
1.  \`name\`: A string containing a plausible and fitting name for the character.
2.  \`gender\`: A string containing the gender of the character. This can be "male", "female", "not-applicable" (for example if the character is non-human) or a custom gender.
3.  \`description\`: A string containing a compelling character biography of 2-3 paragraphs, reflecting the essence, personality, potential appearance, and backstory hinted at by the provided descriptive words.
4.  \`bio\`: A string containing what the character would have on their social media profile. 200 characters max.
5.  \`nsfw\`: A boolean value indicating whether the character contains adult or mature themes (true) or is suitable for all audiences (false).

Do NOT include any introductory text, explanations, markdown formatting codes (like \`\`\`json), or conversational filler before or after the JSON object.Your entire response must be ONLY the JSON object itself.`;

        // Generate the response
        const generatedContent = await generateResponse(
            prompt,
            model,
            systemInstruction,
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