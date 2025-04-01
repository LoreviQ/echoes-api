import { generateResponse } from '../../services/ai_generation';
import { GoogleGenAI } from '@google/genai';

// Mock the Google GenAI library
jest.mock('@google/genai', () => {
    // Create a mock implementation for generateContent
    const mockGenerateContent = jest.fn();

    // Create a mock GoogleGenAI class
    return {
        GoogleGenAI: jest.fn().mockImplementation(() => {
            return {
                models: {
                    generateContent: mockGenerateContent
                }
            };
        })
    };
});

describe('AI Generation Service', () => {
    let mockGenerateContent: jest.Mock;

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Get a reference to the mocked generateContent function
        const GoogleGenAIMock = GoogleGenAI as jest.MockedClass<typeof GoogleGenAI>;
        const googleGenAIInstance = new GoogleGenAIMock({ apiKey: 'fake-key' });
        mockGenerateContent = googleGenAIInstance.models.generateContent as jest.Mock;
    });

    describe('generateResponse', () => {
        it('should throw error for unsupported model', async () => {
            // Execute and assert
            await expect(generateResponse('test prompt', 'unsupported-model'))
                .rejects
                .toThrow('Unsupported model: unsupported-model');
        });

        it('should call Google GenAI for gemini-2.0-flash model', async () => {
            // Setup the mock to return an object with a text property
            mockGenerateContent.mockResolvedValue({ text: 'Generated text content' });

            // Execute
            const result = await generateResponse('test prompt', 'gemini-2.0-flash', 'Be helpful');

            // Assert
            expect(mockGenerateContent).toHaveBeenCalledWith({
                model: 'gemini-2.0-flash',
                contents: 'test prompt',
                config: {
                    systemInstruction: 'Be helpful'
                }
            });
            expect(result).toBe('Generated text content');
        });

        it('should call Google GenAI for gemini-2.5-pro model', async () => {
            // Setup the mock to return an object with a text property
            mockGenerateContent.mockResolvedValue({ text: 'Generated text content' });

            // Execute
            const result = await generateResponse('test prompt', 'gemini-2.5-pro-exp-03-25');

            // Assert
            expect(mockGenerateContent).toHaveBeenCalledWith({
                model: 'gemini-2.5-pro-exp-03-25',
                contents: 'test prompt',
                config: {
                    systemInstruction: ''
                }
            });
            expect(result).toBe('Generated text content');
        });

        it('should use default model if not specified', async () => {
            // Setup the mock to return an object with a text property
            mockGenerateContent.mockResolvedValue({ text: 'Generated text content' });

            // Execute
            const result = await generateResponse('test prompt');

            // Assert
            expect(mockGenerateContent).toHaveBeenCalledWith({
                model: 'gemini-2.5-pro-exp-03-25',
                contents: 'test prompt',
                config: {
                    systemInstruction: ''
                }
            });
            expect(result).toBe('Generated text content');
        });

        it('should propagate errors from Google GenAI', async () => {
            // Setup a specific error to be thrown
            const mockError = new Error('API error');
            mockGenerateContent.mockRejectedValue(mockError);

            // Execute and assert
            await expect(generateResponse('test prompt', 'gemini-2.0-flash'))
                .rejects
                .toThrow('API error');
        });
    });
}); 