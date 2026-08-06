import { BrevoClient } from '@getbrevo/brevo';

const brevoApiKey = (process.env.BREVO_API_KEY || '').trim();

// Initialize the Brevo Client with API key configuration
const brevoClient = new BrevoClient({
  apiKey: brevoApiKey,
});

export default brevoClient;
