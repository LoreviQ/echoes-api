import { Civitai, Scheduler } from 'civitai';
import dotenv from 'dotenv';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { uploadToStorage } from '../supabase';
import { IMAGE_GENERATION_CONFIG } from '../../config/image_generation';

// Load environment variables
dotenv.config();

// Initialize the Civitai client
const civitai = new Civitai({
    auth: process.env.CIVITAI_API_TOKEN || '',
});

/**
 * Recursively drills down through nested job results to find the actual result object
 * @param response The job response object that might be nested
 * @returns The innermost result object containing the blob URL
 */
function findActualResult(response: any): any {
    // If we have a result with a jobs array, drill into the first job
    if (response.result?.jobs?.length > 0) {
        return findActualResult(response.result.jobs[0]);
    }

    // If we have a result with blobUrl, we've found our target
    if (response.result?.blobUrl) {
        return response;
    }

    // If we don't have a nested structure but do have a result, return the current response
    if (response.result) {
        return response;
    }

    // If we don't have a result at all, return the response as is
    return response;
}

interface ImageGenerationParams {
    prompt: string;
    bucketName: string;
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
    nsfw?: boolean;
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
        // Add quality tags to the beginning and end of the prompt
        const enhancedPrompt = `${IMAGE_GENERATION_CONFIG.QUALITY_TAGS_START}, ${params.prompt.trim()}, ${IMAGE_GENERATION_CONFIG.QUALITY_TAGS_END}`;

        // Build negative prompt - add NSFW tags to negative prompt if nsfw is false
        let negativePrompt = params.negativePrompt || IMAGE_GENERATION_CONFIG.DEFAULT_NEGATIVE_PROMPT;
        if ((params.nsfw ?? IMAGE_GENERATION_CONFIG.DEFAULT_NSFW) !== true) {
            negativePrompt = `${IMAGE_GENERATION_CONFIG.NSFW_TAGS}, ${negativePrompt}`;
        }

        // Create input with defaults from config
        const input = {
            model: params.model || IMAGE_GENERATION_CONFIG.DEFAULT_MODEL,
            params: {
                prompt: enhancedPrompt,
                negativePrompt: negativePrompt,
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
        console.log('Civitai API response:', response);

        if (!response.jobs || response.jobs.length === 0) {
            throw new Error('No jobs returned from Civitai API');
        }

        // Get the first job result and find the actual result through any nesting
        const job = response.jobs[0];
        const actualJob = findActualResult(job);

        if (!actualJob.result) {
            throw new Error('No result available in job response');
        }

        if (actualJob.scheduled) {
            throw new Error('Job is still scheduled and not completed');
        }

        if (!actualJob.result.available || !actualJob.result.blobUrl) {
            throw new Error('Image URL not available in job result');
        }

        // Download the image
        const imageUrl = actualJob.result.blobUrl;
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(imageResponse.data);

        // Generate a unique filename
        const fileName = `${Date.now()}-${uuidv4()}`;
        const filePath = `${fileName}.png`;

        // Upload to Supabase storage using the extracted function
        return await uploadToStorage(
            imageBuffer,
            params.bucketName,
            filePath
        );
    } catch (error: any) {
        console.error('Error generating image:', error);
        throw new Error(`Image generation failed: ${error.message}`);
    }
} 