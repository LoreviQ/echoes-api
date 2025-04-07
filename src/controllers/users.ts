import { Response } from 'express';

import type { ContentReference } from 'echoes-shared';

import { AuthenticatedRequest } from '@/middleware/auth';
import { fetchForUser, fetchForPublic } from '@/services/user/fetchForYou';

export const getForYou = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const user = req.user;
        const previouslySeenContent: ContentReference[] = (req.body?.previouslySeenContent) || [];

        let content: ContentReference[];
        if (user) {
            content = await fetchForUser(user, previouslySeenContent);
        } else {
            content = await fetchForPublic(previouslySeenContent);
        }
        return res.status(200).json(content);
    } catch (error) {
        console.error('Error in getForYou:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}