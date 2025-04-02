import express, { Express, Request, Response } from 'express';
import characterRoutes from './routes/characters';
import generationRoutes from './routes/ai_generation';
import dotenv from 'dotenv';
import { messageService } from './services/messages';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const ENABLE_AUTO_RESPONSES: boolean = process.env.ENABLE_AUTO_RESPONSES === 'true';

// Middleware
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next) => {
    console.log(`${req.method} request at ${req.url}`);
    next();
});

// Routes
app.get('/', (req: Request, res: Response) => {
    res.send('Hello World');
});

// API routes
app.use('/v1/characters', characterRoutes);
app.use('/v1/generations', generationRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Only start background services if enabled via environment variable
    // Prevents multiple instances replying to the same messages
    if (ENABLE_AUTO_RESPONSES) {
        console.log('Starting background services...');
        messageService.init();
        console.log('Message auto-response service is running');
    } else {
        console.log('Auto-response services are disabled');
    }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down services...');
    if (ENABLE_AUTO_RESPONSES) {
        messageService.cleanup();
    }
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Shutting down services...');
    if (ENABLE_AUTO_RESPONSES) {
        messageService.cleanup();
    }
    process.exit(0);
});