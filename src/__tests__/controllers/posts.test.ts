import { Request, Response } from 'express';
import { createPost } from '../../controllers/posts';
import supabase from '../../config/supabase';
import { generatePostForCharacter } from '../../services/ai_generation/content';

// Mock generatePostForCharacter function
jest.mock('../../services/ai_generation/content', () => ({
    generatePostForCharacter: jest.fn()
}));

// Mock supabase
jest.mock('../../config/supabase', () => ({
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis()
}));

describe('Posts Controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let responseObject: any;

    beforeEach(() => {
        // Reset mock data
        mockRequest = {};
        responseObject = {};

        // Mock response
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockImplementation(result => {
                responseObject = result;
                return mockResponse as Response;
            })
        };

        // Clear all mocks
        jest.clearAllMocks();
    });

    describe('createPost', () => {
        it('should return 400 if character_id is missing', async () => {
            // Setup
            mockRequest.params = {};

            // Execute
            await createPost(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject).toEqual({ error: 'Character ID is required' });
        });

        it('should create a post successfully', async () => {
            // Setup
            mockRequest.params = { character_id: '123' };

            const mockPost = { id: 1, character_id: '123', content: 'hello world' };

            // Mock the generatePostForCharacter function to return a post
            (generatePostForCharacter as jest.Mock).mockResolvedValue(mockPost);

            // Execute
            await createPost(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(generatePostForCharacter).toHaveBeenCalledWith('123');
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(responseObject).toEqual({
                message: 'Post created successfully',
                post: mockPost
            });
        });

        it('should handle database errors', async () => {
            // Setup
            mockRequest.params = { character_id: '123' };

            // Mock the generatePostForCharacter function to return null (failed)
            (generatePostForCharacter as jest.Mock).mockResolvedValue(null);

            // Execute
            await createPost(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(responseObject).toEqual({ error: 'Failed to create post' });
        });
    });
}); 