import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { fetchForYou } from '../services/user/fetchForYou';

export const getForYou = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const user = req.user;

        const content = await fetchForYou(user);

        return res.status(200).json(content);
    } catch (error) {
        console.error('Error in getForYou:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}