import { Request, Response } from 'express';
import { generateCharacter } from '../../controllers/characters';
import { generateResponse } from '../../services/ai_generation';

// Mock the AI generation service
jest.mock('../../services/ai_generation', () => ({
    generateResponse: jest.fn()
}));

describe('Character Generation Controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let responseObject: any;

    beforeEach(() => {
        // Reset mock data
        mockRequest = {
            body: {}
        };
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

    describe('generateCharacter', () => {
        it('should return 400 if tags are missing', async () => {
            // Setup
            mockRequest.body = {};

            // Execute
            await generateCharacter(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject).toEqual({ error: 'Tags are required' });
        });

        it('should generate character successfully', async () => {
            // Setup
            mockRequest.body = {
                tags: 'brave strong intelligent curious determined loyal creative mysterious wise ancient'
            };

            const mockGeneratedCharacter = {
                name: "Test Character",
                gender: "female",
                description: "Test character description spanning multiple paragraphs",
                bio: "Adventurous explorer seeking new horizons | Coffee lover | Dog parent 🐕",
                nsfw: false
            };

            const mockJsonResponse = JSON.stringify(mockGeneratedCharacter);
            (generateResponse as jest.Mock).mockResolvedValue(mockJsonResponse);

            // Execute
            await generateCharacter(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(generateResponse).toHaveBeenCalledWith(
                expect.stringContaining('brave strong intelligent'),
                'gemini-2.5-pro-exp-03-25',
                expect.stringContaining('You are an expert character creator')
            );
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toEqual({
                success: true,
                content: mockGeneratedCharacter
            });
        });

        it('should handle service errors', async () => {
            // Setup
            mockRequest.body = {
                tags: 'brave strong intelligent curious determined loyal creative mysterious wise ancient'
            };

            const mockError = new Error('Service error');
            (generateResponse as jest.Mock).mockRejectedValue(mockError);

            // Execute
            await generateCharacter(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(responseObject).toEqual({
                success: false,
                error: 'Service error'
            });
        });

        it('should handle invalid generated character data', async () => {
            // Setup
            mockRequest.body = {
                tags: 'brave strong intelligent curious determined loyal creative mysterious wise ancient'
            };

            const invalidJson = '{"name": "Test"}'; // Missing required fields
            (generateResponse as jest.Mock).mockResolvedValue(invalidJson);

            // Execute
            await generateCharacter(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(responseObject.success).toBe(false);
            expect(responseObject.error).toContain('Failed to parse character data');
        });
    });
}); 