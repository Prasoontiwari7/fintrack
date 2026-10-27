# FinTrack Twilio Chatbot Integration

The FinTrack Chatbot connects Twilio (SMS and WhatsApp) directly to your personal finance dashboard. Users can check their current balance, review monthly budgets, track recent transactions, and log expenses/incomes via natural language messages on WhatsApp or SMS.

---

## 1. What You Need from Twilio

To connect your Twilio account to this chatbot, you need the following items from the **[Twilio Console](https://console.twilio.com/)**:

| Variable | Where to find it in Twilio | Description |
| :--- | :--- | :--- |
| **`TWILIO_ACCOUNT_SID`** | Twilio Console Dashboard | Your Account identifier (starts with `AC...`) |
| **`TWILIO_AUTH_TOKEN`** | Twilio Console Dashboard (Click "Show Auth Token") | Secret token used to authenticate API requests |
| **`TWILIO_PHONE_NUMBER`** | Phone Numbers > Active Numbers | Your Twilio SMS phone number (e.g., `+1234567890`) |
| **`TWILIO_WHATSAPP_NUMBER`** | Messaging > Try it out > Send a WhatsApp message | Twilio WhatsApp Sandbox number (defaults to `whatsapp:+14155238886`) or an approved WhatsApp Sender |

---

## 2. Setting Up in `backend/.env`

Add your credentials to `backend/.env`:

```env
# Twilio Chatbot Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_real_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

---

## 3. Webhook Setup (Connecting Twilio to Your Backend)

When a user texts your Twilio number or WhatsApp sandbox, Twilio sends an HTTP POST request to your webhook URL.

### Local Development (using ngrok or localtunnel)
Because Twilio's cloud cannot access `http://localhost:5000` directly, use a public tunnel:

1. In a new terminal, run:
   ```bash
   npx ngrok http 5000
   ```
2. Copy the HTTPS forwarding URL (e.g. `https://a1b2-c3d4.ngrok-free.app`).
3. Set the Webhook URL in Twilio Console:
   - **For WhatsApp Sandbox**:
     - Go to **Messaging > Try it out > Send a WhatsApp message > Sandbox settings**.
     - Set "WHEN A MESSAGE COMES IN" to:
       ```text
       https://a1b2-c3d4.ngrok-free.app/api/chatbot/webhook
       ```
     - HTTP Method: **POST**
     - Click **Save**.
   - **For SMS Phone Number**:
     - Go to **Phone Numbers > Manage > Active numbers > [Your Number]**.
     - Under "Messaging Configuration", set "A MESSAGE COMES IN" to **Webhook**:
       ```text
       https://a1b2-c3d4.ngrok-free.app/api/chatbot/webhook
       ```
     - HTTP Method: **POST**
     - Click **Save**.

---

## 4. How the Chatbot Connects to Your Dashboard

1. **User Phone Linking**:
   - The user sends: `link your-fintrack-email@example.com`
   - The chatbot links that WhatsApp/phone number directly to their FinTrack user account in MongoDB.
   - Alternatively, you can set the `phoneNumber` in the user's profile settings.

2. **Supported Chat Commands**:

| Command | Example Message | What It Does |
| :--- | :--- | :--- |
| **Balance / Status** | `balance` or `status` | Returns Total Balance, Total Income, Total Expenses, and Monthly Spending |
| **Budget** | `budget` | Shows monthly budget vs. spending and percentage used |
| **Log Expense** | `spent 250 on Food pizza` | Immediately creates a negative transaction in your dashboard under that category |
| **Log Income** | `income 50000 Salary monthly paycheck` | Immediately records a new income entry in your dashboard |
| **Recent** | `recent` or `history` | Lists the latest 5 transactions and incomes with timestamps |
| **Link Account** | `link alex@example.com` | Links this phone number to the FinTrack account |
| **Help** | `help` or `commands` | Displays the interactive commands menu |

---

## 5. Direct Test Endpoint (No Twilio Setup Required)

You can test the chatbot right now using the built-in test endpoint without even setting up Twilio:

- **Method**: `POST`
- **URL**: `http://localhost:5000/api/chatbot/test`
- **Body (JSON)**:
  ```json
  {
    "message": "balance"
  }
  ```
