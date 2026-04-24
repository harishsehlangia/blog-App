import { setServers } from "node:dns/promises";
setServers(['1.1.1.1', '8.8.8.8']);

import express from 'express';
import cors from 'cors';
import "dotenv/config";

// Config
import './config/env.js';
import connectDB from './config/db.js';
import './config/firebase.js';

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
let PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// Global middleware
server.use(express.json());
server.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
}));

// Mount routes
server.use(authRoutes);
server.use(blogRoutes);
server.use(commentRoutes);
server.use(notificationRoutes);
server.use(userRoutes);
server.use(uploadRoutes);

// Global error handler (must be after routes)
server.use(errorHandler);

server.listen(PORT, () => {
    console.log('listening on port : ' + PORT);    
});