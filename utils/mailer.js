const sgMail = require('@sendgrid/mail');

function getExecutorVerificationUrl(token) {
  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:8080';
  return `${baseUrl}/executor-register.html?token=${encodeURIComponent(token)}`;
}

function initSendGrid() {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.warn('[Mailer] SENDGRID_API_KEY not configured. Email will not be sent.');
    return false;
  }
  
  sgMail.setApiKey(apiKey);
  console.log('[Mailer] SendGrid initialized successfully');
  return true;
}

async function sendExecutorVerificationEmail({ executorName, executorEmail, token }) {
  const verificationUrl = getExecutorVerificationUrl(token);
  const fromAddress = process.env.EMAIL_FROM || 'noreply@digipass.app';

  console.log('[Mailer] Preparing executor verification email via SendGrid...');
  console.log(`  - to: ${executorEmail}`);
  console.log(`  - from: ${fromAddress}`);
  console.log(`  - verificationUrl: ${verificationUrl}`);

  if (!process.env.SENDGRID_API_KEY) {
    console.warn('[Mailer Fallback] SendGrid API key not configured. Logging invite link instead.');
    console.log(`  - invite link: ${verificationUrl}`);
    return {
      delivered: false,
      verificationUrl
    };
  }

  try {
    console.log('[Mailer] Sending executor verification email via SendGrid...');
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

    const info = await sgMail.send(msg);
    
    console.log('[Mailer] Email sent successfully via SendGrid');
    console.log(`  - statusCode: ${info[0].statusCode}`);

    return {
      delivered: true,
      verificationUrl,
      messageId: info[0].headers['x-message-id']
    };
  } catch (error) {
    console.error('[Mailer] Email send failed via SendGrid');
    console.error(`  - message: ${error.message}`);
    console.error(`  - statusCode: ${error.code || '(none)'}`);
    throw error;
  }
}

module.exports = {
  initSendGrid,
  getExecutorVerificationUrl,
  sendExecutorVerificationEmail
};
