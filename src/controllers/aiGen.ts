import { Request, Response } from 'express';
import { generateResponse } from '../services/aiGen';

interface CharacterGenerationRequest {
    tags: string;
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
Remember to provide the output strictly in the specified JSON format: {"name": "character name", "bio": "2-3 paragraph description here"}.`;

        const systemInstruction = `You are an expert character creator and writer. Your task is to generate a character name and biography based on a list of ten descriptive words provided by the user.
You MUST analyze the provided words, even if they seem contradictory, and synthesize them into a coherent and intriguing character concept.

The output MUST be a single, valid JSON object. This JSON object must contain exactly two keys:
1.  \`name\`: A string containing a plausible and fitting name for the character.
2.  \`bio\`: A string containing a compelling character biography of 2-3 paragraphs, reflecting the essence, personality, potential appearance, and backstory hinted at by the provided descriptive words.

Do NOT include any introductory text, explanations, markdown formatting codes (like \`\`\`json), or conversational filler before or after the JSON object.Your entire response must be ONLY the JSON object itself.`;

        // Generate the response
        const generatedContent = await generateResponse(
            prompt,
            model,
            systemInstruction,
            'character'
        );

        return res.status(200).json({
            success: true,
            content: generatedContent
        });
    } catch (error: any) {
        console.error('Error generating character:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'An unexpected error occurred'
        });
    }
}; 