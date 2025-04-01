import request from 'supertest';
import express from 'express';
import aiGenRouter from '../../routes/ai_generation';
import * as aiGenController from '../../controllers/characters';

// Mock the controllers
jest.mock('../../controllers/aiGen');

const app = express();
app.use(express.json());
app.use('/generations', aiGenRouter);

describe('AI Generation Routes', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('POST /generations', () => {
        it('should call the generateContent controller', async () => {
            // Mock the implementation with the correct method name
            const mockGenerateContent = aiGenController.generateContent as jest.Mock;
            mockGenerateContent.mockImplementation((req, res) => {
                return res.status(200).json({ success: true, content: 'Generated text' });
            });

            // Make the request
            const res = await request(app)
                .post('/generations')
                .send({ model: 'test-model', prompt: 'test prompt' });

            // Assert
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ success: true, content: 'Generated text' });
            expect(mockGenerateContent).toHaveBeenCalledTimes(1);
        });
    });
}); 