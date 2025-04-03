import express, { Router } from 'express';
import { getForYou } from '../controllers/users';

const router: Router = express.Router();

// GET /users/foryou
router.get('/foryou', getForYou);

export default router; 