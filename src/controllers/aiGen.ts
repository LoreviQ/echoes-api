import { Request, Response } from 'express';
import { generateResponse } from '../services/aiGen';

interface GenerationRequest {
    model: string;
    prompt: string;
    systemInstruction?: string;
}

/**
 * Generate content using LLM
 */
export const generateContent = async (req: Request, res: Response): Promise<any> => {
    try {
        const { model, prompt, systemInstruction } = req.body as GenerationRequest;

        // Validate required fields
        if (!model) {
            return res.status(400).json({ error: 'Model name is required' });
        }

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Generate the response
        const generatedContent = await generateResponse(
            prompt,
            model,
            systemInstruction || ''
        );

        return res.status(200).json({
            success: true,
            content: generatedContent
        });
    } catch (error: any) {
        console.error('Error generating content:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'An unexpected error occurred'
        });
    }
}; 