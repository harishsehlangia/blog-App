import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import "dotenv/config";

// Config
import './config/env.js';
import connectDB from './config/db.js';
import { initializePassport } from './config/passport.js';

// Middleware
import errorHandler from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import blogRoutes from './routes/blog.routes.js';
import commentRoutes from './routes/comment.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import userRoutes from './routes/user.routes.js';
import uploadRoutes from './routes/upload.routes.js';

const server = express();
const PORT = process.env.PORT || 8080;

// Global middleware
server.use(helmet({
    contentSecurityPolicy: false, // API-only server, CSP is for HTML documents
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow S3 image loading
    crossOriginEmbedderPolicy: false, // Allow embedding cross-origin resources (S3 images)
}));
server.use(express.json());

const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL,
].filter(Boolean);

server.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Initialize Passport (Google OAuth)
initializePassport(server);

// Health check — Cloud Run uses this to verify container is alive
server.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Mount routes
server.use(authRoutes);
server.use(blogRoutes);
server.use(commentRoutes);
server.use(notificationRoutes);
server.use(userRoutes);
server.use(uploadRoutes);

// Global error handler (must be after routes)
server.use(errorHandler);

// 1. Start listening IMMEDIATELY so Cloud Run sees port 8080 open
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server listening on http://0.0.0.0:${PORT}`);

    // 2. Connect to DB AFTER server is already accepting traffic
    connectDB().catch(err => {
        console.error('❌ DB connection error (non-fatal):', err.message);
    });
});