import { v2 as cloudinary } from 'cloudinary';

const cloud_name = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
const api_key = (process.env.CLOUDINARY_API_KEY || '').trim();
const api_secret = (process.env.CLOUDINARY_API_SECRET || '').trim();

// Configure Cloudinary SDK with trimmed credentials
cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
});

console.log(`[Cloudinary] Initialized with Cloud Name: "${cloud_name}"`);

export default cloudinary;
