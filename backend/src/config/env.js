import dotenv from 'dotenv';

// Disable env overrides on production platforms like Render to preserve dashboard values
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;

dotenv.config({ override: !isProduction });

console.log('[Env] Environment variables loaded successfully.');
