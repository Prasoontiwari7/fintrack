import mongoose from 'mongoose';

/**
 * Initializes connection to the MongoDB Atlas cluster with production-grade configurations.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('CRITICAL DATABASE ERROR: MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  // Production Mongoose Options
  const options = {
    serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30 seconds
    socketTimeoutMS: 45000,         // Close inactive sockets after 45 seconds
    maxPoolSize: 10,                // Maintain up to 10 socket connections
    family: 4,                      // Force IPv4 DNS resolution (avoids Windows IPv6 lookup timeout crashes)
  };

  // Connection Event Listeners
  mongoose.connection.on('connected', () => {
    console.log(`[MongoDB] Connected successfully. Cluster host: ${mongoose.connection.host}`);
  });

  mongoose.connection.on('error', (err) => {
    console.error(`[MongoDB] Connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Connection disconnected. Attempting automatic reconnection...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[MongoDB] Connection re-established successfully.');
  });

  console.log('[MongoDB] Connecting to MongoDB Atlas cluster...');
  try {
    await mongoose.connect(uri, options);
  } catch (error) {
    console.error('\n=========================================');
    console.error('DATABASE CONNECTIVITY WARNING/ERROR');
    console.error(`Reason: ${error.message}`);
    console.error('Verify network connection, firewalls, and MONGODB_URI credentials.');
    console.error('The server will remain online and attempt to reconnect automatically.');
    console.error('=========================================\n');
    // We do NOT call process.exit(1) here.
    // This allows the Express server to stay online and Mongoose to handle background retries.
  }
};

/**
 * Cleanly closes the Mongoose connection.
 */
export const gracefulShutdown = async () => {
  console.log('[MongoDB] Closing database connection due to process termination...');
  try {
    await mongoose.connection.close();
    console.log('[MongoDB] Mongoose connection closed gracefully.');
  } catch (err) {
    console.error('[MongoDB] Error closing connection:', err.message);
  }
};

export default connectDB;
