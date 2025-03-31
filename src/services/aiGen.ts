import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const gemini_ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const models_to_provider: Record<string, string> = {
    "gemini-2.0-flash": "google",
    "gemini-2.5-pro-exp-03-25": "google",
    // TODO: Add more models and providers
}

// adapter pattern for different providers and models
export async function generateResponse(prompt: string, model: string = "gemini-2.5-pro-exp-03-25", systemInstruction: string = "") {
    switch (models_to_provider[model]) {
        case "google":
            return googleGenerate(prompt, model, systemInstruction);
        default:
            throw new Error(`Unsupported model: ${model}`);
    }
}

// uses google genai to generate a response
async function googleGenerate(prompt: string, model: string, systemInstruction: string = "") {
    try {
        const response = await gemini_ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        console.log("Generation successful");
        return response.text;
    } catch (error) {
        console.error("Error generating content:", error);
        throw error;
    }
} 