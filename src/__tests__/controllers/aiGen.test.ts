import { Request, Response } from 'express';
import { generateContent } from '../../controllers/aiGen';
import { generateResponse } from '../../services/aiGen';

// Mock the AI generation service
jest.mock('../../services/aiGen', () => ({
    generateResponse: jest.fn()
}));

describe('AI Generation Controller', () => {
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

    describe('generateContent', () => {
        it('should return 400 if model is missing', async () => {
            // Setup
            mockRequest.body = { prompt: 'test prompt' };

            // Execute
            await generateContent(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject).toEqual({ error: 'Model name is required' });
        });

        it('should return 400 if prompt is missing', async () => {
            // Setup
            mockRequest.body = { model: 'test-model' };

            // Execute
            await generateContent(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject).toEqual({ error: 'Prompt is required' });
        });

        it('should generate content successfully', async () => {
            // Setup
            mockRequest.body = {
                model: 'test-model',
                prompt: 'test prompt',
                systemInstruction: 'Be helpful'
            };

            const mockGeneratedText = 'This is the generated response';
            (generateResponse as jest.Mock).mockResolvedValue(mockGeneratedText);

            // Execute
            await generateContent(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(generateResponse).toHaveBeenCalledWith(
                'test prompt',
                'test-model',
                'Be helpful'
            );
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toEqual({
                success: true,
                content: mockGeneratedText
            });
        });

        it('should use empty string for systemInstruction if not provided', async () => {
            // Setup
            mockRequest.body = {
                model: 'test-model',
                prompt: 'test prompt'
            };

            const mockGeneratedText = 'This is the generated response';
            (generateResponse as jest.Mock).mockResolvedValue(mockGeneratedText);

            // Execute
            await generateContent(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(generateResponse).toHaveBeenCalledWith(
                'test prompt',
                'test-model',
                ''
            );
        });

        it('should handle service errors', async () => {
            // Setup
            mockRequest.body = {
                model: 'test-model',
                prompt: 'test prompt'
            };

            const mockError = new Error('Service error');
            (generateResponse as jest.Mock).mockRejectedValue(mockError);

            // Execute
            await generateContent(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(responseObject).toEqual({
                success: false,
                error: 'Service error'
            });
        });
    });
}); 