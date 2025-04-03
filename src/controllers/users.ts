import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

export const getForYou = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        return res.status(200).json({
            message: 'Successfully authenticated',
            user: user
        });
    } catch (error) {
        console.error('Error in getForYou:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}