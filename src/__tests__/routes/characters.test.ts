import request from 'supertest';
import express from 'express';
import charactersRouter from '../../routes/characters';
import * as postsController from '../../controllers/posts';

// Mock the controllers
jest.mock('../../controllers/posts');

const app = express();
app.use(express.json());
app.use('/characters', charactersRouter);

describe('Characters Routes', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('POST /characters/:character_id/posts', () => {
        it('should call the createPost controller', async () => {
            // Mock the implementation
            const mockCreatePost = postsController.createPost as jest.Mock;
            mockCreatePost.mockImplementation((req, res) => {
                return res.status(201).json({ message: 'Post created successfully' });
            });

            // Make the request
            const res = await request(app)
                .post('/characters/123/posts')
                .send({});

            // Assert
            expect(res.status).toBe(201);
            expect(res.body).toEqual({ message: 'Post created successfully' });
            expect(mockCreatePost).toHaveBeenCalledTimes(1);
        });
    });
}); 