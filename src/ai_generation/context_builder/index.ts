import { joinWithNewlines } from '@/utils/string';

export interface BasePrompts {
    PROMPT: {
        prefix?: string;
        suffix?: string;
    }
    SYSTEM: {
        prefix?: string;
        suffix?: string;
    }
}

export interface Provider {
    title: string;
    content: unknown; // Can be any type serializable to JSON
}

// Optional settings type (empty for now)
export interface ContextBuilderSettings { }

export class ContextBuilder {
    private basePrompts: BasePrompts;
    private providers: Provider[];
    private settings: ContextBuilderSettings;

    constructor(basePrompts: BasePrompts, settings: ContextBuilderSettings = {}) {
        this.basePrompts = basePrompts;
        this.settings = settings;
        this.providers = [];
    }

    addProvider(provider: Provider): this {
        this.providers.push(provider);
        return this; // Allow chaining
    }

    // Returns the built user prompt
    async prompt(): Promise<string> {
        const { prefix, suffix } = this.basePrompts.PROMPT;
        return joinWithNewlines([prefix, suffix]);
    }

    // Returns the built system prompt
    async system(): Promise<string> {
        const { prefix, suffix } = this.basePrompts.SYSTEM;
        return joinWithNewlines([prefix, suffix]);
    }
}

// Factory function as requested by the user
export function builder(basePrompts: BasePrompts, settings?: ContextBuilderSettings): ContextBuilder {
    return new ContextBuilder(basePrompts, settings);
}
