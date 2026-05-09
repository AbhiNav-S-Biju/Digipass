const sgMail = require('@sendgrid/mail');
const { getExecutorVerificationUrl } = require('./qrCode');

let sendgridInitialized = false;

function initSendGrid() {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.warn('[Mailer] SENDGRID_API_KEY not configured. Email will not be sent.');
    return false;
  }
  
  sgMail.setApiKey(apiKey);
  sendgridInitialized = true;
  console.log('[Mailer] SendGrid ready');
  return true;
}

async function sendExecutorVerificationEmail({ executorName, executorEmail, token }) {
  const verificationUrl = getExecutorVerificationUrl(token);
  const fromAddress = process.env.EMAIL_FROM || 'noreply@digipass.com';

  if (!process.env.SENDGRID_API_KEY || !sendgridInitialized) {
    console.warn(`[Email] Not sent to ${executorEmail}: SENDGRID_API_KEY is not configured`);
    return {
      delivered: false,
      verificationUrl,
      reason: 'sendgrid_not_configured'
    };
  }

  try {
    const msg = {
      to: executorEmail,
      from: fromAddress,
      subject: 'DIGIPASS Executor Invitation',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>DIGIPASS Executor Invitation</h2>
          <p>Hello ${executorName},</p>
          <p>You have been invited to register as an executor in DIGIPASS.</p>
          <p>Click the button below to verify your email and create your executor account:</p>
          <p>
            <a href="${verificationUrl}" style="display:inline-block;padding:12px 18px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;">
              Verify And Register
            </a>
          </p>
          <p>If the button does not work, use this link:</p>
          <p><a href="${verificationUrl}">${verificationUrl}</a></p>
          <p>This link expires in 24 hours.</p>
        </div>
      `
    };

    const response = await sgMail.send(msg);
    const statusCode = response[0].statusCode;
    const messageId = response[0].headers['x-message-id'];
    
    console.log(`[Email] Sent executor verification to ${executorEmail} (status ${statusCode}, messageId ${messageId || 'n/a'})`);

    return {
      delivered: true,
      verificationUrl,
      statusCode,
      messageId
    };
  } catch (error) {
    const sendGridMessage = error.response?.body?.errors?.[0]?.message;
    console.error(`[Email] Failed executor verification to ${executorEmail}: ${sendGridMessage || error.message}`);
    throw error;
  }
}

module.exports = {
  initSendGrid,
  getExecutorVerificationUrl,
  sendExecutorVerificationEmail
};
