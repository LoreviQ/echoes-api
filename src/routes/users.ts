import express, { Router } from 'express';
import { getForYou } from '../controllers/users';
import { optionalAuth } from '../middleware/auth';

const router: Router = express.Router();

// GET /users/foryou - Protected route
router.get('/foryou', optionalAuth, getForYou);

export default router; 