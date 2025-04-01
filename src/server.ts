import express, { Express, Request, Response } from 'express';
import characterRoutes from './routes/characters';
import generationRoutes from './routes/ai_generation';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3001;

// Middleware
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
    res.send('Hello World');
});

// API routes
app.use('/v1/characters', characterRoutes);
app.use('/v1/generations', generationRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});