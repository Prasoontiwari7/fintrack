import './config/env.js';

// Validate Environment Variables on Startup
const requiredVars = [
  'PORT',
  'NODE_ENV',
  'MONGODB_URI',
  'JWT_SECRET',
  'CLIENT_URL',
  'BREVO_API_KEY',
  'BREVO_SENDER_EMAIL',
  'BREVO_SENDER_NAME',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const missingVars = requiredVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error('\n=========================================');
  console.error('CRITICAL SERVER BOOT FAILURE: Missing Environment Variables');
  console.error(`The following keys are not configured in your .env: ${missingVars.join(', ')}`);
  console.error('Please configure all variables to proceed.');
  console.error('=========================================\n');
  process.exit(1); // Stop the server with a descriptive error
}

import app from './app.js';
import connectDB, { gracefulShutdown } from './config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to Database and start server
let server;
connectDB().then(() => {
  server = app.listen(PORT, () => {
    console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}).catch((err) => {
  console.error('[Server] Failed to initialize backend server:', err.message);
  process.exit(1);
});

// Graceful process termination handler
const shutdownGracefully = async (exitCode = 0) => {
  console.log(`\n[Process] Received termination signal. Initiating graceful shutdown (Exit code: ${exitCode})...`);
  
  if (server) {
    server.close(() => {
      console.log('[Process] Express HTTP server stopped listening.');
    });
  }

  // Gracefully close database connection
  await gracefulShutdown();
  
  console.log('[Process] Shutdown completed.');
  process.exit(exitCode);
};

// Global Process Event Listeners
process.on('uncaughtException', (err) => {
  console.error('\n=========================================');
  console.error('CRITICAL: UNCAUGHT EXCEPTION DETECTED');
  console.error('Error Stack Trace:', err.stack);
  console.error('=========================================\n');
  shutdownGracefully(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n=========================================');
  console.error('CRITICAL: UNHANDLED PROMISE REJECTION DETECTED');
  console.error('Reason:', reason);
  console.error('=========================================\n');
  shutdownGracefully(1);
});

// Handle kill/terminate signals
process.on('SIGINT', () => shutdownGracefully(0));
process.on('SIGTERM', () => shutdownGracefully(0));
