import { Provider } from "@/ai_generation/context_builder";

export type ImageType = 'avatar' | 'banner'

type ImageTypeDescription = {
    [key in ImageType]: string;
}

const imageTypeDescriptions: ImageTypeDescription = {
    avatar: 'Generate an avatar for a social media profile. It should feature the character prominently.',
    banner: 'Generate a banner for a social media profile. It could contain the character, or a background scene that the character would like.',
}

export function imageTypeProvider(imageType: ImageType): Provider {
    return {
        title: 'Image Type',
        type: 'prompt',
        execute: async () => {
            return imageTypeDescriptions[imageType];
        }
    }
}