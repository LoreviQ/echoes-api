import { Request, Response } from 'express';
import { createPost } from '../../controllers/posts';
import supabase from '../../config/supabase';

// Mock supabase
jest.mock('../../config/supabase', () => ({
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis()
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

            const mockData = [{ id: 1, character_id: '123', content: 'hello world' }];
            const mockFrom = supabase.from as jest.Mock;
            const mockInsert = jest.fn().mockReturnThis();
            const mockSelect = jest.fn().mockResolvedValue({ data: mockData, error: null });

            mockFrom.mockReturnValue({
                insert: mockInsert,
                select: mockSelect
            });

            // Execute
            await createPost(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockFrom).toHaveBeenCalledWith('posts');
            expect(mockInsert).toHaveBeenCalledWith({
                character_id: '123',
                content: 'hello world'
            });
            expect(mockSelect).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(responseObject).toEqual({
                message: 'Post created successfully',
                post: mockData[0]
            });
        });

        it('should handle database errors', async () => {
            // Setup
            mockRequest.params = { character_id: '123' };

            const mockError = { message: 'Database error' };
            const mockFrom = supabase.from as jest.Mock;
            const mockInsert = jest.fn().mockReturnThis();
            const mockSelect = jest.fn().mockResolvedValue({ data: null, error: mockError });

            mockFrom.mockReturnValue({
                insert: mockInsert,
                select: mockSelect
            });

            // Execute
            await createPost(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(responseObject).toEqual({ error: 'Database error' });
        });
    });
}); 