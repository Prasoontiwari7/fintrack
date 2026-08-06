import brevoClient from '../config/brevo.js';

/**
 * Dispatches an email to the user with the report file attached via Brevo REST API.
 * @param {String} emailAddress 
 * @param {String} userName 
 * @param {Buffer} fileBuffer 
 * @param {String} fileFormat ('pdf' | 'excel')
 * @param {String} periodLabel 
 * @param {Object} summary 
 * @returns {Promise<Object>} response
 */
export const sendReportEmail = async (emailAddress, userName, fileBuffer, fileFormat, periodLabel, summary) => {
  // 1. Audit and trim Brevo configuration variables
  const requiredBrevoVars = ['BREVO_API_KEY', 'BREVO_SENDER_EMAIL', 'BREVO_SENDER_NAME'];
  const missingVars = requiredBrevoVars.filter((v) => !process.env[v]);
  if (missingVars.length > 0) {
    throw new Error(`Brevo configuration is incomplete. Missing env: ${missingVars.join(', ')}`);
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL.trim();
  const senderName = process.env.BREVO_SENDER_NAME.trim();

  // 2. Validate attachment buffer exists
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error(`The generated ${fileFormat.toUpperCase()} report attachment is empty or failed to generate.`);
  }

  const extension = fileFormat === 'pdf' ? 'pdf' : 'xlsx';
  const dateTag = new Date().toISOString().slice(0, 10);
  const filename = `FinTrack_Report_${dateTag}.${extension}`;

  // Rich HTML layout matching the FinTrack dark theme with high contrast values
  const balanceColor = summary.netBalance >= 0 ? '#6fae8c' : '#b3552f';
  const balanceSign = summary.netBalance >= 0 ? '+' : '-';
  
  const htmlBody = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #13160f; color: #f3eee3; padding: 30px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #c9a35e30;">
      <div style="text-align: center; border-bottom: 2px solid #c9a35e; padding-bottom: 15px; margin-bottom: 20px;">
        <h1 style="color: #c9a35e; margin: 0; font-size: 28px; letter-spacing: 1px; font-weight: bold;">FinTrack</h1>
        <p style="color: #8b8579; margin: 5px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Personal Finance Dashboard</p>
      </div>
      <div style="padding: 10px 0;">
        <h2 style="color: #f3eee3; font-size: 18px; margin-top: 0; font-weight: 600;">Hello ${userName},</h2>
        <p style="color: #8b8579; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          Your requested transaction report for the period <strong>${periodLabel}</strong> has been generated successfully. Please find the attached statement containing your audited transactions ledger.
        </p>
        
        <div style="background-color: #0d0f0a; border: 1px solid #c9a35e15; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
          <h3 style="color: #c9a35e; margin-top: 0; margin-bottom: 15px; font-size: 14px; text-align: center; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Statement Summary</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #f3eee3;">
            <tr>
              <td style="padding: 8px 0; color: #8b8579; text-align: left;">Total Incomes:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #6fae8c; text-align: right;">₹${summary.totalIncome.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #8b8579; text-align: left;">Total Expenses:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #c9a35e; text-align: right;">-₹${summary.totalExpense.toLocaleString()}</td>
            </tr>
            <tr style="border-top: 1px solid #c9a35e20;">
              <td style="padding: 10px 0 0 0; color: #f3eee3; font-weight: bold; text-align: left;">Net Balance:</td>
              <td style="padding: 10px 0 0 0; font-weight: bold; color: ${balanceColor}; text-align: right;">${balanceSign}₹${Math.abs(summary.netBalance).toLocaleString()}</td>
            </tr>
          </table>
        </div>
        
        <p style="color: #8b8579; font-size: 13px; line-height: 1.6; margin-bottom: 0;">
          Thank you for choosing <strong>FinTrack</strong> to monitor your financial wellness.
        </p>
      </div>
      <div style="text-align: center; border-top: 1px solid #c9a35e15; padding-top: 15px; margin-top: 25px; color: #8b8579; font-size: 11px; line-height: 1.4;">
        This is an automated report. Do not reply to this email.<br/>
        &copy; 2026 FinTrack Inc. All rights reserved.
      </div>
    </div>
  `;

  const textBody = `Hello ${userName},\n\nYour requested transaction report for period "${periodLabel}" has been generated successfully.\n\nSummary:\n- Incomes: ₹${summary.totalIncome.toLocaleString()}\n- Expenses: ₹${summary.totalExpense.toLocaleString()}\n- Remaining Balance: ₹${summary.netBalance.toLocaleString()}\n\nPlease find the attached report.\n\nThank you for using FinTrack.`;

  // Convert generated attachment buffer to Base64 string for Brevo API
  const base64Content = fileBuffer.toString('base64');

  const emailData = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: emailAddress.trim(), name: userName }],
    subject: 'Your FinTrack Transaction Report',
    htmlContent: htmlBody,
    textContent: textBody,
    attachment: [
      {
        content: base64Content,
        name: filename,
      },
    ],
  };

  console.log('-----------------------------------------');
  console.log('[Brevo] Sending Transactional Email details:');
  console.log(`- Recipient: ${emailAddress}`);
  console.log(`- Subject: ${emailData.subject}`);
  console.log(`- Attachment: ${filename}`);
  console.log(`- Attachment Size: ${fileBuffer.length} bytes`);
  console.log('-----------------------------------------');

  try {
    const response = await brevoClient.transactionalEmails.sendTransacEmail(emailData);

    console.log('[Brevo] API Send Mail Response Summary:');
    console.log('Response:', response);
    
    if (response && response.messageId) {
      console.log('Message ID:', response.messageId);
    }

    return response;
  } catch (error) {
    console.error('[Brevo] Critical Error sending email. Full stack trace:', error);
    if (error.response && error.response.body) {
      console.error('[Brevo API Error Body]:', JSON.stringify(error.response.body));
    }
    throw error;
  }
};
