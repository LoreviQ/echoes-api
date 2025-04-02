import { Civitai, Scheduler } from 'civitai';
import dotenv from 'dotenv';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { recordGeneration, uploadToStorage } from './supabase';
import { IMAGE_GENERATION_CONFIG } from '../config/image_generation';

// Load environment variables
dotenv.config();

// Initialize the Civitai client
const civitai = new Civitai({
    auth: process.env.CIVITAI_API_TOKEN || '',
});

interface ImageGenerationParams {
    prompt: string;
    model?: string;
    negativePrompt?: string;
    scheduler?: Scheduler;
    steps?: number;
    cfgScale?: number;
    width?: number;
    height?: number;
    seed?: number;
    clipSkip?: number;
    additionalNetworks?: Record<string, { strength?: number; triggerWord?: string }>;
}

/**
 * Generates an image using Civitai API and uploads to Supabase storage
 * @param params Image generation parameters
 * @returns Public URL of the uploaded image
 */
export async function generateImage(params: ImageGenerationParams): Promise<string> {
    if (!params.prompt) {
        throw new Error('Prompt is required for image generation');
    }

    try {
        // Create input with defaults from config
        const input = {
            model: params.model || IMAGE_GENERATION_CONFIG.DEFAULT_MODEL,
            params: {
                prompt: params.prompt,
                negativePrompt: params.negativePrompt || IMAGE_GENERATION_CONFIG.DEFAULT_NEGATIVE_PROMPT,
                scheduler: params.scheduler || IMAGE_GENERATION_CONFIG.DEFAULT_SCHEDULER,
                steps: params.steps || IMAGE_GENERATION_CONFIG.DEFAULT_STEPS,
                cfgScale: params.cfgScale || IMAGE_GENERATION_CONFIG.DEFAULT_CFG_SCALE,
                width: params.width || IMAGE_GENERATION_CONFIG.DEFAULT_WIDTH,
                height: params.height || IMAGE_GENERATION_CONFIG.DEFAULT_HEIGHT,
                seed: params.seed || IMAGE_GENERATION_CONFIG.DEFAULT_SEED,
                clipSkip: params.clipSkip || IMAGE_GENERATION_CONFIG.DEFAULT_CLIP_SKIP,
            },
        };

        // Start the image generation
        console.log('Generating image with Civitai API...');
        const response = await civitai.image.fromText(input, true); // Wait for job to complete

        if (!response.jobs || response.jobs.length === 0) {
            throw new Error('No jobs returned from Civitai API');
        }

        // Get the first job result
        const job = response.jobs[0];

        if (!job.result?.blobUrl) {
            throw new Error('Image URL not available in job result');
        }

        // Download the image
        const imageUrl = job.result.blobUrl;
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(imageResponse.data);

        // Generate a unique filename
        const fileName = `${Date.now()}-${uuidv4()}`;
        const filePath = `${fileName}.png`;

        // Upload to Supabase storage using the extracted function
        return await uploadToStorage(
            imageBuffer,
            IMAGE_GENERATION_CONFIG.BUCKET_NAME,
            filePath
        );
    } catch (error: any) {
        console.error('Error generating image:', error);
        throw new Error(`Image generation failed: ${error.message}`);
    }
} 