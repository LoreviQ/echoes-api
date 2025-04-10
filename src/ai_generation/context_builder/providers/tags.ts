import { Provider } from "@/ai_generation/context_builder";

export function tagsProvider(tags: string): Provider {
    return {
        title: 'Character Tags',
        type: 'prompt',
        execute: async () => tags,
    }
}