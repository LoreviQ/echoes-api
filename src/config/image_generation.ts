import { Scheduler } from 'civitai';

export const IMAGE_GENERATION_CONFIG = {
    // Default model to use for image generation
    DEFAULT_MODEL: 'urn:air:sd1:checkpoint:civitai:4201@130072',

    // Supabase storage bucket name
    BUCKET_NAME: 'character-avatars',

    // Default parameters
    DEFAULT_NEGATIVE_PROMPT: '(deformed iris, deformed pupils, semi-realistic, cgi, 3d, render, sketch, cartoon, drawing, anime, mutated hands and fingers:1.4), (deformed, distorted, disfigured:1.3)',
    DEFAULT_SCHEDULER: Scheduler.EULER_A,
    DEFAULT_STEPS: 20,
    DEFAULT_CFG_SCALE: 7,
    DEFAULT_WIDTH: 512,
    DEFAULT_HEIGHT: 512,
    DEFAULT_SEED: -1,
    DEFAULT_CLIP_SKIP: 2,
}; 