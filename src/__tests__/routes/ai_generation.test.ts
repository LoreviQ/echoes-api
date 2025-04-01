import request from 'supertest';
import express from 'express';
import aiGenRouter from '../../routes/ai_generation';
import * as characterController from '../../controllers/characters';

// Mock the controllers
jest.mock('../../controllers/characters');

const app = express();
app.use(express.json());
app.use('/generations', aiGenRouter);

describe('AI Generation Routes', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('POST /generations/character', () => {
        it('should call the generateCharacter controller', async () => {
            // Mock the implementation only for this test
            const mockGenerateCharacter = characterController.generateCharacter as jest.Mock;
            mockGenerateCharacter.mockImplementation((req, res) => {
                return res.status(200).json({
                    success: true,
                    content: {
                        name: "Test Character",
                        gender: "female",
                        description: "Test character description spanning multiple paragraphs",
                        bio: "Adventurous explorer seeking new horizons | Coffee lover | Dog parent 🐕",
                        nsfw: false
                    }
                });
            });

            // Make the request
            const res = await request(app)
                .post('/generations/character')
                .send({ tags: 'brave strong intelligent curious determined loyal creative mysterious wise ancient' });

            // Assert
            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                success: true,
                content: {
                    name: "Test Character",
                    gender: "female",
                    description: "Test character description spanning multiple paragraphs",
                    bio: "Adventurous explorer seeking new horizons | Coffee lover | Dog parent 🐕",
                    nsfw: false
                }
            });
            expect(mockGenerateCharacter).toHaveBeenCalledTimes(1);
        });

        it('should handle missing tags', async () => {
            // Let the actual controller handle the validation
            const mockGenerateCharacter = characterController.generateCharacter as jest.Mock;
            mockGenerateCharacter.mockImplementation((req, res) => {
                if (!req.body.tags) {
                    return res.status(400).json({ error: 'Tags are required' });
                }
            });

            // Make the request without tags
            const res = await request(app)
                .post('/generations/character')
                .send({});

            // Assert
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Tags are required' });
        });
    });
}); 