import { Request, Response, NextFunction } from 'express';
import type { User } from '@supabase/supabase-js';

import supabase from '@/config/supabase';

// Extend Express Request type to include user
export interface AuthenticatedRequest extends Request {
    user?: User | null;  // Allow null for unauthenticated requests
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

export const optionalAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        // If no auth header, continue with null user
        if (!authHeader) {
            (req as AuthenticatedRequest).user = null;
            next();
            return;
        }

        // Extract token from Bearer format
        const token = authHeader.split(' ')[1];

        // Verify the JWT token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        // If token is invalid, continue with null user instead of sending error
        if (error || !user) {
            (req as AuthenticatedRequest).user = null;
            next();
            return;
        }

        // Add the user to the request object
        (req as AuthenticatedRequest).user = user;

        next();
    } catch (error) {
        console.error('Optional auth middleware error:', error);
        // Even on error, we'll continue with null user
        (req as AuthenticatedRequest).user = null;
        next();
    }
}; 