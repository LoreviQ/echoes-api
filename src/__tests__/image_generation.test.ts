import { Civitai } from 'civitai';
import axios from 'axios';
import { generateImage } from '../services/image_generation';
import { uploadToStorage } from '../services/supabase';

// Mock the external dependencies
jest.mock('civitai');
jest.mock('axios');
jest.mock('../services/supabase');

describe('Image Generation Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully generate and upload an image', async () => {
        // Mock Civitai response
        const mockBlobUrl = 'https://example.com/image.png';
        const mockCivitaiResponse = {
            token: "W3siSm9icyI6WyJjYzJkOGViNy1mOGE0LTRkNzYtOTE3Yi01OTliODRiZmRmNmYiXX1d",
            jobs: [{
                jobId: "cc2d8eb7-f8a4-4d76-917b-599b84bfdf6f",
                cost: 1.2,
                result: {
                    blobKey: "0B60A87CDFB8E7307D0F19F623EBD8240307BD9C2345CD03B7E52A489A52CC47",
                    available: true,
                    blobUrl: mockBlobUrl,
                    blobUrlExpirationDate: "2024-03-04T08:04:02.4149309Z"
                },
                scheduled: false
            }]
        };

        (Civitai as jest.Mock).mockImplementation(() => ({
            image: {
                fromText: jest.fn().mockResolvedValue(mockCivitaiResponse)
            }
        }));

        // Mock axios get response
        const mockImageBuffer = Buffer.from('mock-image-data');
        (axios.get as jest.Mock).mockResolvedValue({
            data: mockImageBuffer
        });

        // Mock storage upload response
        const mockUploadUrl = 'https://storage.example.com/uploaded-image.png';
        (uploadToStorage as jest.Mock).mockResolvedValue(mockUploadUrl);

        // Test parameters
        const params = {
            prompt: 'test prompt',
            bucketName: 'test-bucket'
        };

        // Execute test
        const result = await generateImage(params);

        // Assertions
        expect(result).toBe(mockUploadUrl);
        expect(axios.get).toHaveBeenCalledWith(mockBlobUrl, { responseType: 'arraybuffer' });
        expect(uploadToStorage).toHaveBeenCalledWith(
            mockImageBuffer,
            'test-bucket',
            expect.stringMatching(/^\d+-[\w-]+\.png$/)
        );
    });

    it('should handle missing image URL in job result', async () => {
        // Mock Civitai response with missing blobUrl
        const mockCivitaiResponse = {
            token: "W3siSm9icyI6WyJjYzJkOGViNy1mOGE0LTRkNzYtOTE3Yi01OTliODRiZmRmNmYiXX1d",
            jobs: [{
                jobId: "cc2d8eb7-f8a4-4d76-917b-599b84bfdf6f",
                cost: 1.2,
                result: {
                    blobKey: "0B60A87CDFB8E7307D0F19F623EBD8240307BD9C2345CD03B7E52A489A52CC47",
                    available: false
                },
                scheduled: true
            }]
        };

        (Civitai as jest.Mock).mockImplementation(() => ({
            image: {
                fromText: jest.fn().mockResolvedValue(mockCivitaiResponse)
            }
        }));

        // Test parameters
        const params = {
            prompt: 'test prompt',
            bucketName: 'test-bucket'
        };

        // Execute test and expect error
        await expect(generateImage(params))
            .rejects
            .toThrow('Image generation failed: Image URL not available in job result');
    });
}); 