import twilio from 'twilio';

const accountSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
const authToken = (process.env.TWILIO_AUTH_TOKEN || '').trim();
const twilioPhoneNumber = (process.env.TWILIO_PHONE_NUMBER || '').trim();
const twilioWhatsappNumber = (process.env.TWILIO_WHATSAPP_NUMBER || '').trim();

let twilioClient = null;

export const isTwilioConfigured = () => {
  return Boolean(
    accountSid &&
    authToken &&
    !accountSid.includes('your_') &&
    !authToken.includes('your_')
  );
};

if (isTwilioConfigured()) {
  try {
    twilioClient = twilio(accountSid, authToken);
    console.log('[Twilio] Chatbot client initialized successfully.');
  } catch (error) {
    console.error('[Twilio] Failed to initialize Twilio client:', error.message);
  }
} else {
  console.log('[Twilio] Chatbot running in mock/offline mode (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN not set).');
}

export {
  twilioClient,
  accountSid,
  authToken,
  twilioPhoneNumber,
  twilioWhatsappNumber,
};
