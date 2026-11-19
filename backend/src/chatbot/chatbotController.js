import twilio from 'twilio';
import {
  twilioClient,
  isTwilioConfigured,
  twilioPhoneNumber,
  twilioWhatsappNumber,
} from './twilioConfig.js';
import { processIncomingMessage } from './chatbotService.js';

// In-memory message deduplication cache to handle Twilio retry duplicates
const processedMessageSids = new Map();

// Periodically clean up message IDs older than 30 minutes
setInterval(() => {
  const cutoff = Date.now() - 30 * 60 * 1000;
  for (const [sid, timestamp] of processedMessageSids.entries()) {
    if (timestamp < cutoff) {
      processedMessageSids.delete(sid);
    }
  }
}, 15 * 60 * 1000).unref();

/**
 * Validates cryptographic signature sent by Twilio
 */
export const validateTwilioWebhookSignature = (req) => {
  const authToken = (process.env.TWILIO_AUTH_TOKEN || '').trim();
  const signature = req.headers['x-twilio-signature'] || req.headers['X-Twilio-Signature'];

  // Allow bypass in development mode when signature header is missing (e.g. testing with curl or Postman)
  if (!signature && process.env.NODE_ENV === 'development') {
    return true;
  }

  if (!authToken || !signature) {
    return false;
  }

  // Reconstruct the exact URL Twilio sent the request to (accounting for reverse proxies)
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const originalUrl = req.originalUrl || req.url;
  const fullUrl = `${protocol}://${host}${originalUrl}`;

  try {
    return twilio.validateRequest(authToken, signature, fullUrl, req.body);
  } catch (err) {
    console.error('[Twilio Signature Validation Error]:', err.message);
    return false;
  }
};

/**
 * Handle incoming webhook from Twilio (SMS or WhatsApp)
 * @route POST /api/chatbot/webhook
 */
export const handleTwilioWebhook = async (req, res, next) => {
  try {
    console.log('[Twilio Webhook] ===== INCOMING REQUEST =====');
    console.log('[Twilio Webhook] Headers:', JSON.stringify({
      'content-type': req.headers['content-type'],
      'x-twilio-signature': req.headers['x-twilio-signature'] ? 'present' : 'missing',
      'x-forwarded-proto': req.headers['x-forwarded-proto'],
      'x-forwarded-host': req.headers['x-forwarded-host'],
      host: req.headers.host,
    }));
    console.log('[Twilio Webhook] Body:', JSON.stringify(req.body));

    // 1. Signature Validation — SKIP in development mode (ngrok URL issues)
    const isDev = process.env.NODE_ENV !== 'production';
    const enforceSignature =
      process.env.ENFORCE_TWILIO_SIGNATURE === 'true' ||
      (!isDev && Boolean(req.headers['x-twilio-signature']));

    if (enforceSignature && !validateTwilioWebhookSignature(req)) {
      console.warn('[Twilio Webhook] Rejected request: Invalid X-Twilio-Signature.');
      return res.status(403).send('Forbidden: Invalid Twilio signature');
    }

    if (isDev) {
      console.log('[Twilio Webhook] Dev mode: skipping signature validation.');
    }

    // 2. Extract payload fields
    const incomingText = req.body.Body || req.body.body || '';
    const fromPhone = req.body.From || req.body.from || '';
    const messageSid = req.body.MessageSid || req.body.messageSid || req.body.SmsMessageSid;

    console.log(`[Twilio Webhook] Parsed → From: "${fromPhone}", Body: "${incomingText}", SID: ${messageSid || 'N/A'}`);

    if (!incomingText && !fromPhone) {
      console.warn('[Twilio Webhook] Empty payload — returning empty TwiML.');
      const { MessagingResponse } = twilio.twiml;
      const twiml = new MessagingResponse();
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      return res.end(twiml.toString());
    }

    // 3. Deduplication Check (Idempotency against Twilio automatic retries)
    if (messageSid) {
      if (processedMessageSids.has(messageSid)) {
        console.log(`[Twilio Webhook] Duplicate MessageSid "${messageSid}" detected. Acknowledging without re-processing.`);
        const { MessagingResponse } = twilio.twiml;
        const twiml = new MessagingResponse();
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        return res.end(twiml.toString());
      }
      processedMessageSids.set(messageSid, Date.now());
    }

    // 4. Process message through chatbot service (AI MuRIL classifier + DB logging)
    console.log('[Twilio Webhook] Processing message through chatbot service...');
    const replyText = await processIncomingMessage({
      text: incomingText,
      fromPhone,
    });

    console.log(`[Twilio Webhook] Reply generated (${replyText.length} chars): "${replyText.substring(0, 120)}..."`);

    // 5. Build standard TwiML response
    const { MessagingResponse } = twilio.twiml;
    const twiml = new MessagingResponse();
    twiml.message(replyText);

    const twimlStr = twiml.toString();
    console.log(`[Twilio Webhook] Sending TwiML response: ${twimlStr.substring(0, 200)}...`);

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twimlStr);
  } catch (error) {
    console.error('[Twilio Webhook Error]:', error.message);
    console.error('[Twilio Webhook Error Stack]:', error.stack);

    // Always return valid TwiML so Twilio doesn't report an error to the user
    try {
      const { MessagingResponse } = twilio.twiml;
      const twiml = new MessagingResponse();
      twiml.message(
        'Sorry, an error occurred while processing your request. Please try again in a moment.'
      );
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(twiml.toString());
    } catch (fallbackError) {
      next(error);
    }
  }
};

/**
 * Test endpoint for invoking chatbot logic via direct JSON API
 * Useful for development and testing without needing Twilio setup
 * @route POST /api/chatbot/test
 */
export const testChatbot = async (req, res, next) => {
  try {
    const { message, phone, userId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message string in request body',
      });
    }

    const reply = await processIncomingMessage({
      text: message,
      fromPhone: phone || '+919999999999',
      authenticatedUserId: userId || (req.user ? req.user._id : undefined),
    });

    res.json({
      success: true,
      data: {
        input: message,
        reply,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check Twilio and Chatbot connection status
 * @route GET /api/chatbot/status
 */
export const getChatbotStatus = async (req, res) => {
  const configured = isTwilioConfigured();

  res.json({
    success: true,
    data: {
      status: 'active',
      isTwilioConfigured: configured,
      twilioPhoneNumber: twilioPhoneNumber ? twilioPhoneNumber.slice(0, 4) + '****' : null,
      twilioWhatsappNumber: twilioWhatsappNumber ? 'configured' : null,
      webhookUrl: '/api/chatbot/webhook',
      supportedCommands: [
        'balance',
        'budget',
        'recent',
        'spend <amount> on <category> [note]',
        'income <amount> <source> [note]',
        'link <your-email>',
        'help',
      ],
    },
  });
};

/**
 * Helper to send proactive SMS or WhatsApp messages using Twilio REST Client
 */
export const sendProactiveMessage = async ({ to, body, isWhatsApp = false }) => {
  if (!isTwilioConfigured() || !twilioClient) {
    console.warn('[Twilio] Cannot send message: Twilio credentials not configured.');
    return { success: false, reason: 'Twilio not configured' };
  }

  const from = isWhatsApp ? twilioWhatsappNumber : twilioPhoneNumber;
  const targetRecipient = isWhatsApp && !to.startsWith('whatsapp:') ? `whatsapp:${to}` : to;

  try {
    const message = await twilioClient.messages.create({
      body,
      from,
      to: targetRecipient,
    });

    return {
      success: true,
      messageSid: message.sid,
    };
  } catch (error) {
    console.error('[Twilio Send Error]:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};
