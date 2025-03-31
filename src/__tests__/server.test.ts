import request from 'supertest';
import express, { Express } from 'express';

// Mock express and routes
jest.mock('express', () => {
    const mockApp = {
        use: jest.fn(),
        get: jest.fn(),
        listen: jest.fn()
    };
    const mockExpress = jest.fn(() => mockApp) as jest.Mock & { json: jest.Mock };
    mockExpress.json = jest.fn().mockReturnValue('json-middleware');
    return mockExpress;
});

jest.mock('../routes/characters', () => 'mock-characters-routes');
jest.mock('../routes/aiGen', () => 'mock-ai-gen-routes');
jest.mock('dotenv', () => ({
    config: jest.fn()
}));

describe('Server', () => {
    let mockApp: any;

    beforeEach(() => {
        // Clear module cache to reset the mocks between tests
        jest.resetModules();

        // Reset express mock
        mockApp = (express() as unknown) as Express;
    });

    it('should initialize the server correctly', async () => {
        // Set environment variables
        process.env.PORT = '4000';

        // Import the server (this will execute the server code)
        await import('../server');

        // Assert middleware is set up
        expect(express.json).toHaveBeenCalled();
        expect(mockApp.use).toHaveBeenCalledWith('json-middleware');

        // Assert routes are set up
        expect(mockApp.get).toHaveBeenCalledWith('/', expect.any(Function));
        expect(mockApp.use).toHaveBeenCalledWith('/characters', 'mock-characters-routes');
        expect(mockApp.use).toHaveBeenCalledWith('/generations', 'mock-ai-gen-routes');

        // Assert server is started
        expect(mockApp.listen).toHaveBeenCalledWith(4000, expect.any(Function));
    });

    it('should use default port if PORT env is not set', async () => {
        // Clear PORT environment variable
        delete process.env.PORT;

        // Re-import the server
        await import('../server');

        // Assert server uses default port
        expect(mockApp.listen).toHaveBeenCalledWith(3000, expect.any(Function));
    });
}); 