import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import leadRoutes from './src/routes/leadRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Setup Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/ai', aiRoutes);

// Base System Health Check Route
app.get('/api/health', (req, res) => {
  const dbStatus = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  const dbState = mongoose.connection.readyState;
  
  res.status(200).json({
    status: 'UP',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
    server: {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      port: PORT
    },
    database: {
      status: dbStatus[dbState] || 'Unknown',
      readyState: dbState,
      name: mongoose.connection.name || 'N/A'
    }
  });
});

// Global Centralized Error Middleware Handler
app.use((err, req, res, next) => {
  console.error(`[Server Error] ${err.stack}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Main Server Initialization Function
const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Bind Server to Port
  const server = app.listen(PORT, () => {
    console.log(`[Server] Express server is active in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  // Graceful Shutdown Handler
  const shutdown = () => {
    console.log('\n[Server] Shutdown signal received. Closing active connections...');
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      mongoose.connection.close(false).then(() => {
        console.log('[Database] MongoDB connection closed.');
        process.exit(0);
      });
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer();
