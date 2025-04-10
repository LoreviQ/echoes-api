import { imageTypeProvider } from '../imageType';

describe('imageTypeProvider', () => {
    it('should return the correct provider structure', () => {
        const provider = imageTypeProvider('avatar');
        expect(provider.title).toBe('Image Type');
        expect(provider.type).toBe('prompt');
        expect(provider.execute).toBeInstanceOf(Function);
    });

    it('should return the correct description for "avatar"', async () => {
        const provider = imageTypeProvider('avatar');
        const description = await provider.execute();
        expect(description).toBe('Generate an avatar for a social media profile. It should feature the character prominently.');
    });

    it('should return the correct description for "banner"', async () => {
        const provider = imageTypeProvider('banner');
        const description = await provider.execute();
        expect(description).toBe('Generate a banner for a social media profile. It could contain the character, or a background scene that the character would like.');
    });
}); 