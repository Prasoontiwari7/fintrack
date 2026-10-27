import express from 'express';
import {
  handleTwilioWebhook,
  testChatbot,
  getChatbotStatus,
} from './chatbotController.js';

const router = express.Router();

// GET /api/chatbot/status - Check twilio configuration & supported commands
router.get('/status', getChatbotStatus);

// POST /api/chatbot/webhook - Twilio incoming message webhook (SMS or WhatsApp)
// Also support /we and / in case the Twilio Sandbox URL input box truncated the path
router.post('/webhook', handleTwilioWebhook);
router.post('/we', handleTwilioWebhook);
router.post('/', handleTwilioWebhook);
router.get('/webhook', handleTwilioWebhook);
router.get('/we', handleTwilioWebhook);

// POST /api/chatbot/test - Direct test endpoint for testing chatbot logic
router.post('/test', testChatbot);

export default router;
