import dotenv from 'dotenv';

// Load and populate environment variables immediately (with forced override)
dotenv.config({ override: true });

console.log('[Env] Environment variables loaded successfully.');
