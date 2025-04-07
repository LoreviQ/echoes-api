import express, { Router } from 'express';

import { getForYou } from '@/controllers/users';
import { optionalAuth } from '@/middleware/auth';

const router: Router = express.Router();

// POST /users/foryou
router.post('/foryou', optionalAuth, getForYou);

export default router; 