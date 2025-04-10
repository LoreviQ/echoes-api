import { tagsProvider } from '../tags';

describe('tagsProvider', () => {
    it('should return a provider with the correct title and type', () => {
        const tags = 'example tags';
        const provider = tagsProvider(tags);
        expect(provider.title).toBe('Character Tags');
        expect(provider.type).toBe('prompt');
    });

    it('should return a provider whose execute function returns the tags', async () => {
        const tags = 'example tags';
        const provider = tagsProvider(tags);
        const result = await provider.execute();
        expect(result).toBe(tags);
    });

    it('should handle empty tags string', async () => {
        const tags = '';
        const provider = tagsProvider(tags);
        expect(provider.title).toBe('Character Tags');
        expect(provider.type).toBe('prompt');
        const result = await provider.execute();
        expect(result).toBe(tags);
    });
});