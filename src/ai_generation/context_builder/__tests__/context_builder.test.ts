import { builder, BasePrompts, Provider } from '../index';

// Mock providers for testing
const mockSystemProvider: Provider = {
    title: 'System Provider',
    type: 'system',
    execute: async () => 'system provider content'
};

const mockPromptProvider: Provider = {
    title: 'Prompt Provider',
    type: 'prompt',
    execute: async () => 'prompt provider content'
};

const mockErrorProvider: Provider = {
    title: 'Error Provider',
    type: 'system',
    execute: async () => { throw new Error('Provider error'); }
};

describe('ContextBuilder', () => {
    let basePrompts: BasePrompts;

    beforeEach(() => {
        basePrompts = {
            PROMPT: {
                prefix: 'prompt prefix',
                suffix: 'prompt suffix'
            },
            SYSTEM: {
                prefix: 'system prefix',
                suffix: 'system suffix'
            }
        };
    });

    it('should create a builder with base prompts', () => {
        const contextBuilder = builder(basePrompts);
        expect(contextBuilder).toBeDefined();
    });

    describe('prompt()', () => {
        it('should join prefix and suffix with newlines', async () => {
            const contextBuilder = builder(basePrompts);
            const prompt = await contextBuilder.prompt();
            expect(prompt).toBe('prompt prefix\n\nprompt suffix');
        });

        it('should return only prefix when suffix is missing', async () => {
            const contextBuilder = builder({
                ...basePrompts,
                PROMPT: { prefix: 'prompt prefix' }
            });
            const prompt = await contextBuilder.prompt();
            expect(prompt).toBe('prompt prefix');
        });

        it('should return only suffix when prefix is missing', async () => {
            const contextBuilder = builder({
                ...basePrompts,
                PROMPT: { suffix: 'prompt suffix' }
            });
            const prompt = await contextBuilder.prompt();
            expect(prompt).toBe('prompt suffix');
        });

        it('should return empty string when both are missing', async () => {
            const contextBuilder = builder({
                ...basePrompts,
                PROMPT: {}
            });
            const prompt = await contextBuilder.prompt();
            expect(prompt).toBe('');
        });

        it('should include provider content between prefix and suffix', async () => {
            const contextBuilder = builder(basePrompts);
            contextBuilder.addProvider(mockPromptProvider);
            const prompt = await contextBuilder.prompt();
            expect(prompt).toBe('prompt prefix\n\n**Prompt Provider**\nprompt provider content\n\nprompt suffix');
        });

        it('should include provider content after prefix when suffix is missing', async () => {
            const contextBuilder = builder({
                ...basePrompts,
                PROMPT: { prefix: 'prompt prefix' }
            });
            contextBuilder.addProvider(mockPromptProvider);
            const prompt = await contextBuilder.prompt();
            expect(prompt).toBe('prompt prefix\n\n**Prompt Provider**\nprompt provider content');
        });

        it('should include provider content before suffix when prefix is missing', async () => {
            const contextBuilder = builder({
                ...basePrompts,
                PROMPT: { suffix: 'prompt suffix' }
            });
            contextBuilder.addProvider(mockPromptProvider);
            const prompt = await contextBuilder.prompt();
            expect(prompt).toBe('**Prompt Provider**\nprompt provider content\n\nprompt suffix');
        });

        it('should return only provider content when both prefix and suffix are missing', async () => {
            const contextBuilder = builder({
                ...basePrompts,
                PROMPT: {}
            });
            contextBuilder.addProvider(mockPromptProvider);
            const prompt = await contextBuilder.prompt();
            expect(prompt).toBe('**Prompt Provider**\nprompt provider content');
        });

        it('should ignore system providers when building prompt', async () => {
            const contextBuilder = builder(basePrompts);
            contextBuilder.addProvider(mockSystemProvider);
            const prompt = await contextBuilder.prompt();
            expect(prompt).toBe('prompt prefix\n\nprompt suffix');
        });

        it('should handle multiple prompt providers', async () => {
            const anotherPromptProvider: Provider = {
                title: 'Another Provider',
                type: 'prompt',
                execute: async () => 'another content'
            };

            const contextBuilder = builder(basePrompts);
            contextBuilder.addProvider(mockPromptProvider);
            contextBuilder.addProvider(anotherPromptProvider);

            const prompt = await contextBuilder.prompt();
            expect(prompt).toBe('prompt prefix\n\n**Prompt Provider**\nprompt provider content\n\n**Another Provider**\nanother content\n\nprompt suffix');
        });

        it('should handle error from provider gracefully', async () => {
            const errorPromptProvider: Provider = { ...mockErrorProvider, type: 'prompt' };
            const contextBuilder = builder(basePrompts);
            contextBuilder.addProvider(errorPromptProvider);

            const prompt = await contextBuilder.prompt();
            expect(prompt).toBe('prompt prefix\n\nprompt suffix');
        });
    });

    describe('system()', () => {
        it('should join prefix and suffix with newlines', async () => {
            const contextBuilder = builder(basePrompts);
            const system = await contextBuilder.system();
            expect(system).toBe('system prefix\n\nsystem suffix');
        });

        it('should return only prefix when suffix is missing', async () => {
            const contextBuilder = builder({
                ...basePrompts,
                SYSTEM: { prefix: 'system prefix' }
            });
            const system = await contextBuilder.system();
            expect(system).toBe('system prefix');
        });

        it('should return only suffix when prefix is missing', async () => {
            const contextBuilder = builder({
                ...basePrompts,
                SYSTEM: { suffix: 'system suffix' }
            });
            const system = await contextBuilder.system();
            expect(system).toBe('system suffix');
        });

        it('should return empty string when both are missing', async () => {
            const contextBuilder = builder({
                ...basePrompts,
                SYSTEM: {}
            });
            const system = await contextBuilder.system();
            expect(system).toBe('');
        });

        it('should include provider content between prefix and suffix', async () => {
            const contextBuilder = builder(basePrompts);
            contextBuilder.addProvider(mockSystemProvider);
            const system = await contextBuilder.system();
            expect(system).toBe('system prefix\n\n**System Provider**\nsystem provider content\n\nsystem suffix');
        });

        it('should include provider content after prefix when suffix is missing', async () => {
            const contextBuilder = builder({
                ...basePrompts,
                SYSTEM: { prefix: 'system prefix' }
            });
            contextBuilder.addProvider(mockSystemProvider);
            const system = await contextBuilder.system();
            expect(system).toBe('system prefix\n\n**System Provider**\nsystem provider content');
        });

        it('should include provider content before suffix when prefix is missing', async () => {
            const contextBuilder = builder({
                ...basePrompts,
                SYSTEM: { suffix: 'system suffix' }
            });
            contextBuilder.addProvider(mockSystemProvider);
            const system = await contextBuilder.system();
            expect(system).toBe('**System Provider**\nsystem provider content\n\nsystem suffix');
        });

        it('should return only provider content when both prefix and suffix are missing', async () => {
            const contextBuilder = builder({
                ...basePrompts,
                SYSTEM: {}
            });
            contextBuilder.addProvider(mockSystemProvider);
            const system = await contextBuilder.system();
            expect(system).toBe('**System Provider**\nsystem provider content');
        });

        it('should ignore prompt providers when building system', async () => {
            const contextBuilder = builder(basePrompts);
            contextBuilder.addProvider(mockPromptProvider);
            const system = await contextBuilder.system();
            expect(system).toBe('system prefix\n\nsystem suffix');
        });

        it('should handle multiple system providers', async () => {
            const anotherSystemProvider: Provider = {
                title: 'Another System Provider',
                type: 'system',
                execute: async () => 'another system content'
            };

            const contextBuilder = builder(basePrompts);
            contextBuilder.addProvider(mockSystemProvider);
            contextBuilder.addProvider(anotherSystemProvider);

            const system = await contextBuilder.system();
            expect(system).toBe('system prefix\n\n**System Provider**\nsystem provider content\n\n**Another System Provider**\nanother system content\n\nsystem suffix');
        });

        it('should handle error from provider gracefully', async () => {
            const contextBuilder = builder(basePrompts);
            contextBuilder.addProvider(mockErrorProvider);

            const system = await contextBuilder.system();
            expect(system).toBe('system prefix\n\nsystem suffix');
        });
    });
});