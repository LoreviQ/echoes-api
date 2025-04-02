import { Scheduler } from 'civitai';

export const IMAGE_GENERATION_CONFIG = {
    // Default model to use for image generation
    DEFAULT_MODEL: 'urn:air:sdxl:checkpoint:civitai:140272@1483080',

    // Default parameters
    DEFAULT_NEGATIVE_PROMPT: 'sketch, worst quality, comic, multiple views, bad quality, low quality, lowres, displeasing, very displeasing, bad anatomy, bad hands, scan artifacts, monochrome, greyscale, twitter username, jpeg artifacts, 2koma, 4koma, guro, extra digits, fewer digits, jaggy lines, unclear Detailer negative: "(philtrum), blush lines, eyeshadow, plastic, doll, anime, drawing, worst quality, bad quality, low quality, lowres, displeasing, very displeasing, bad anatomy, scan artifacts, monochrome, greyscale, jaggy lines, unclear',
    DEFAULT_SCHEDULER: Scheduler.EULER_A,
    DEFAULT_STEPS: 20,
    DEFAULT_CFG_SCALE: 6,
    DEFAULT_WIDTH: 512,
    DEFAULT_HEIGHT: 512,
    DEFAULT_SEED: -1,
    DEFAULT_CLIP_SKIP: 0,

    // Prompt modifications
    QUALITY_TAGS_START: 'masterwork, realistic:1.2, masterpiece, best quality, very aesthetic, hyper-detailed:1.2, 8k uhd:1.4',
    QUALITY_TAGS_END: 'masterpiece, amazing quality',
}; 