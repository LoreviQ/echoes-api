import { Character } from 'echoes-shared';
import { characterDetailsProvider } from '../characterDetails';
import { database } from 'echoes-shared';
import { wrapInCodeBlock } from '@/utils/string';

// Mock the database module
jest.mock('echoes-shared', () => ({
    database: {
        getCharacter: jest.fn()
    }
}));

// Mock the string utils
jest.mock('@/utils/string', () => ({
    wrapInCodeBlock: jest.fn((str) => `\`\`\`json\n${str}\n\`\`\``)
}));

describe('characterDetailsProvider', () => {
    const mockCharacter: Character = {
        id: 'test-id',
        user_id: 'user-123',
        name: 'Test Character',
        bio: 'Test bio',
        description: 'Test description',
        avatar_url: 'https://example.com/avatar.jpg',
        banner_url: 'https://example.com/banner.jpg',
        public: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        path: '/test-character',
        nsfw: false,
        tags: 'tag1,tag2',
        gender: 'other',
        appearance: 'Test appearance',
        subscriber_count: 10
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return a provider with correct title and type', () => {
        const provider = characterDetailsProvider('test-id');
        expect(provider.title).toBe('Character Details');
        expect(provider.type).toBe('prompt');
    });

    it('should successfully fetch and format character details', async () => {
        // Mock the database response
        (database.getCharacter as jest.Mock).mockResolvedValue({
            character: mockCharacter,
            error: null
        });

        const provider = characterDetailsProvider('test-id');
        const result = await provider.execute();

        // Verify database was called with correct parameters
        expect(database.getCharacter).toHaveBeenCalledWith('test-id', expect.anything());

        // Verify the result is properly formatted
        expect(wrapInCodeBlock).toHaveBeenCalledWith(
            JSON.stringify(mockCharacter, null, 2)
        );
    });

    it('should throw an error when database call fails', async () => {
        const mockError = new Error('Database error');
        (database.getCharacter as jest.Mock).mockResolvedValue({
            character: null,
            error: mockError
        });

        const provider = characterDetailsProvider('test-id');
        await expect(provider.execute()).rejects.toThrow();

        expect(database.getCharacter).toHaveBeenCalledWith('test-id', expect.anything());
    });
}); 