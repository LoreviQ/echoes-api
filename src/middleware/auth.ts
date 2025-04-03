import { Request, Response, NextFunction } from 'express';
import supabase from '../config/supabase';
import { User } from '@supabase/supabase-js';

// Extend Express Request type to include user
export interface AuthenticatedRequest extends Request {
    user?: User;  // Make user optional since it won't exist before middleware runs
}

export const requireAuth = async (
    req: Request,  // Use base Request type here
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            res.status(401).json({ error: 'No authorization header provided' });
            return;
        }

        // Extract token from Bearer format
        const token = authHeader.split(' ')[1];

        // Verify the JWT token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            res.status(401).json({ error: 'Invalid or expired token' });
            return;
        }

        // Add the user to the request object
        (req as AuthenticatedRequest).user = user;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}; 