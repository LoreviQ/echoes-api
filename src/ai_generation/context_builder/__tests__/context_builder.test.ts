import { builder, BasePrompts } from '../index';

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
    });
});