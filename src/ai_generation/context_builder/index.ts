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

export type ProviderType = 'system' | 'prompt';

export interface Provider {
    title: string;
    type: ProviderType;
    execute: () => Promise<unknown>; // Function that returns provider content asynchronously
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

    // Formats provider content into a string
    private formatProviderContent(title: string, content: unknown): string {
        return `**${title}**\n${content}`;
    }

    // Executes providers of the specified type and formats their results
    private async executeProviders(type: ProviderType): Promise<string | undefined> {
        const filteredProviders = this.providers.filter(provider => provider.type === type);

        if (filteredProviders.length === 0) {
            return undefined;
        }

        const results = await Promise.all(
            filteredProviders.map(async (provider) => {
                try {
                    const content = await provider.execute();
                    return this.formatProviderContent(provider.title, content);
                } catch (error) {
                    console.error(`Error executing provider "${provider.title}":`, error);
                    return undefined; // Skip failed providers
                }
            })
        );

        return joinWithNewlines(results.filter(result => result !== undefined));
    }

    // Returns the built user prompt
    async prompt(): Promise<string> {
        const { prefix, suffix } = this.basePrompts.PROMPT;
        const providerContent = await this.executeProviders('prompt');

        if (providerContent) {
            return joinWithNewlines([prefix, providerContent, suffix].filter(Boolean));
        }

        return joinWithNewlines([prefix, suffix].filter(Boolean));
    }

    // Returns the built system prompt
    async system(): Promise<string> {
        const { prefix, suffix } = this.basePrompts.SYSTEM;
        const providerContent = await this.executeProviders('system');

        if (providerContent) {
            return joinWithNewlines([prefix, providerContent, suffix].filter(Boolean));
        }

        return joinWithNewlines([prefix, suffix].filter(Boolean));
    }
}

// Factory function as requested by the user
export function builder(basePrompts: BasePrompts, settings?: ContextBuilderSettings): ContextBuilder {
    return new ContextBuilder(basePrompts, settings);
}
