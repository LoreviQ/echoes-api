import { Request, Response } from 'express';

export const getForYou = async (req: Request, res: Response): Promise<any> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            console.log('No authorization header provided');
            return res.status(401).json({ error: 'No authorization header provided' });
        }

        // Extract token from Bearer format
        const token = authHeader.split(' ')[1];
        console.log('Extracted token:', token);

        return res.status(200).json({ message: 'Token extracted and logged' });
    } catch (error) {
        console.error('Error extracting token:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}