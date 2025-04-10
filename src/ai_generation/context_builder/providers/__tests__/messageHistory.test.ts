import { messageHistoryProvider } from '../messageHistory';
import { database } from 'echoes-shared';
import { wrapInCodeBlock } from '@/utils/string';
import supabase from '@/config/supabase';
import { type MessageSchema, type ThreadIDs } from 'echoes-shared';
import { type User } from '@supabase/supabase-js';

// Mock dependencies
jest.mock('echoes-shared', () => ({
    database: {
        getMessages: jest.fn(),
        getCharacter: jest.fn(),
        getThread: jest.fn()
    }
}));

jest.mock('@/config/supabase', () => ({
    auth: {
        admin: {
            getUserById: jest.fn()
        }
    }
}));

jest.mock('@/utils/string', () => ({
    wrapInCodeBlock: jest.fn((str) => `\`\`\`json\n${str}\n\`\`\``)
}));

describe('messageHistoryProvider', () => {
    const mockThread: ThreadIDs = {
        id: 'thread-123',
        user_id: 'user-abc',
        character_id: 'char-xyz'
    };

    const mockMessages: MessageSchema[] = [
        { id: 'msg-1', thread_id: mockThread.id, sender_type: 'user', content: 'Hello', created_at: '2024-01-01T10:00:00.000Z' },
        { id: 'msg-2', thread_id: mockThread.id, sender_type: 'character', content: 'Hi there!', created_at: '2024-01-01T10:00:05.000Z' },
        { id: 'msg-3', thread_id: mockThread.id, sender_type: 'user', content: 'How are you?', created_at: '2024-01-01T10:00:10.000Z' }
    ];

    const mockUser = { id: mockThread.user_id, email: 'user@example.com' } as User;
    const mockCharacter = { id: mockThread.character_id, name: 'Test Bot' };
    const mockThreadData = { thread: mockThread, error: null };

    const formattedMessages = [
        { from: 'user@example.com', content: 'Hello', sent_at: '2024-01-01 10:00:00' },
        { from: 'Test Bot', content: 'Hi there!', sent_at: '2024-01-01 10:00:05' },
        { from: 'user@example.com', content: 'How are you?', sent_at: '2024-01-01 10:00:10' }
    ];
    const expectedJsonString = JSON.stringify(formattedMessages, null, 2);
    const expectedResult = `\`\`\`json\n${expectedJsonString}\n\`\`\``;

    beforeEach(() => {
        jest.clearAllMocks();
        (database.getThread as jest.Mock).mockResolvedValue(mockThreadData);
    });

    it('should return a provider with correct title and type', () => {
        const provider = messageHistoryProvider(mockThread.id);
        expect(provider.title).toBe('Message History');
        expect(provider.type).toBe('prompt');
    });

    it('should successfully fetch and format message history', async () => {
        // Mock successful database and auth calls
        (database.getMessages as jest.Mock).mockResolvedValue({ messages: mockMessages, error: null });
        (supabase.auth.admin.getUserById as jest.Mock).mockResolvedValue({ data: { user: mockUser }, error: null });
        (database.getCharacter as jest.Mock).mockResolvedValue({ character: mockCharacter, error: null });

        const provider = messageHistoryProvider(mockThread.id);
        const result = await provider.execute();

        // Verify calls
        expect(database.getThread).toHaveBeenCalledWith(mockThread.id, supabase);
        expect(database.getMessages).toHaveBeenCalledWith(mockThread.id, supabase);
        expect(supabase.auth.admin.getUserById).toHaveBeenCalledWith(mockThread.user_id);
        expect(database.getCharacter).toHaveBeenCalledWith(mockThread.character_id, supabase);
        expect(wrapInCodeBlock).toHaveBeenCalledWith(expectedJsonString);

        // Verify result
        expect(result).toEqual({ messageHistory: expectedResult, error: null });
    });

    it('should return error if getThread fails', async () => {
        const mockError = new Error('Database error fetching thread');
        (database.getThread as jest.Mock).mockResolvedValue({ thread: null, error: mockError });

        const provider = messageHistoryProvider(mockThread.id);
        const result = await provider.execute();

        expect(result).toEqual({ messageHistory: null, error: mockError });
        expect(database.getMessages).not.toHaveBeenCalled();
        expect(supabase.auth.admin.getUserById).not.toHaveBeenCalled();
        expect(database.getCharacter).not.toHaveBeenCalled();
        expect(wrapInCodeBlock).not.toHaveBeenCalled();
    });

    it('should return error if getMessages fails', async () => {
        const mockError = new Error('Database error fetching messages');
        (database.getMessages as jest.Mock).mockResolvedValue({ messages: null, error: mockError });

        const provider = messageHistoryProvider(mockThread.id);
        const result = await provider.execute();

        expect(result).toEqual({ messageHistory: null, error: mockError });
        expect(database.getThread).toHaveBeenCalledWith(mockThread.id, supabase);
        expect(supabase.auth.admin.getUserById).not.toHaveBeenCalled();
        expect(database.getCharacter).not.toHaveBeenCalled();
        expect(wrapInCodeBlock).not.toHaveBeenCalled();
    });

    it('should return error if getUserById fails', async () => {
        const mockError = new Error('Auth error fetching user');
        (database.getMessages as jest.Mock).mockResolvedValue({ messages: mockMessages, error: null });
        (supabase.auth.admin.getUserById as jest.Mock).mockResolvedValue({ data: { user: null }, error: mockError });

        const provider = messageHistoryProvider(mockThread.id);
        const result = await provider.execute();

        expect(result).toEqual({ messageHistory: null, error: mockError });
        expect(database.getMessages).toHaveBeenCalledWith(mockThread.id, supabase);
        expect(database.getCharacter).not.toHaveBeenCalled();
        expect(wrapInCodeBlock).not.toHaveBeenCalled();
    });

    it('should return error if getCharacter fails', async () => {
        const mockError = new Error('Database error fetching character');
        (database.getMessages as jest.Mock).mockResolvedValue({ messages: mockMessages, error: null });
        (supabase.auth.admin.getUserById as jest.Mock).mockResolvedValue({ data: { user: mockUser }, error: null });
        (database.getCharacter as jest.Mock).mockResolvedValue({ character: null, error: mockError });

        const provider = messageHistoryProvider(mockThread.id);
        const result = await provider.execute();

        expect(result).toEqual({ messageHistory: null, error: mockError });
        expect(database.getMessages).toHaveBeenCalledWith(mockThread.id, supabase);
        expect(supabase.auth.admin.getUserById).toHaveBeenCalledWith(mockThread.user_id);
        expect(wrapInCodeBlock).not.toHaveBeenCalled();
    });
});