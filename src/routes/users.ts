import express, { Router } from 'express';
import { getForYou } from '../controllers/users';
import { requireAuth } from '../middleware/auth';

const router: Router = express.Router();

// GET /users/foryou - Protected route
router.get('/foryou', requireAuth, getForYou);

export default router; 