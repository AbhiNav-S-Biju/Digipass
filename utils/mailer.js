const nodemailer = require('nodemailer');

function getExecutorVerificationUrl(token) {
  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:8080';
  return `${baseUrl}/executor-register.html?token=${encodeURIComponent(token)}`;
}

function createTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[Mailer] SMTP not fully configured. Falling back to console logging.');
    return null;
  }

  // Use port 465 (SMTPS) for better reliability on cloud infrastructure
  const secure = true;
  const port = 465;
  const smtpUser = process.env.SMTP_USER.trim();
  const smtpPass = process.env.SMTP_PASS.replace(/\s+/g, '');

  console.log('[Mailer] Creating transporter with config:');
  console.log(`  - host: ${process.env.SMTP_HOST}`);
  console.log(`  - port: ${port}`);
  console.log(`  - secure: ${secure}`);
  console.log(`  - user loaded: ${Boolean(smtpUser)}`);
  console.log(`  - pass loaded: ${Boolean(smtpPass)}`);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: smtpUser,
      pass: smtpPass
    },
    family: 4,  // Force IPv4
    connectionTimeout: 10000,  // 10 second timeout
    socketTimeout: 10000,  // 10 second socket timeout
    pool: true,  // Use connection pooling
    maxConnections: 3,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5,  // Rate limit to 5 emails per second
    logger: true,
    debug: true
  });
}

async function sendExecutorVerificationEmail({ executorName, executorEmail, token }) {
  const verificationUrl = getExecutorVerificationUrl(token);
  const transporter = createTransporter();
  const fromAddress = (process.env.EMAIL_FROM || process.env.SMTP_USER || '').trim();

  console.log('[Mailer] Preparing executor verification email...');
  console.log(`  - to: ${executorEmail}`);
  console.log(`  - from: ${fromAddress || '(missing)'}`);
  console.log(`  - verificationUrl: ${verificationUrl}`);

  if (transporter) {
    try {
      console.log('[Mailer] Verifying SMTP transporter...');
      await transporter.verify();
      console.log('[Mailer] SMTP transporter verified successfully.');

      console.log('[Mailer] Sending executor verification email...');
      const info = await transporter.sendMail({
        from: fromAddress,
        to: executorEmail,
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
            <p>${verificationUrl}</p>
            <p>This link expires in 24 hours.</p>
          </div>
        `
      });

      console.log('[Mailer] Email sent successfully.');
      console.log(`  - messageId: ${info.messageId}`);
      console.log(`  - accepted: ${info.accepted.join(', ') || '(none)'}`);
      console.log(`  - rejected: ${info.rejected.join(', ') || '(none)'}`);

      return {
        delivered: true,
        verificationUrl,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('[Mailer] Email send failed.');
      console.error(`  - message: ${error.message}`);
      console.error(`  - code: ${error.code || '(none)'}`);
      console.error(`  - response: ${error.response || '(none)'}`);
      console.error(`  - command: ${error.command || '(none)'}`);
      throw error;
    }
  }

  console.log('[Mailer Fallback] SMTP unavailable. Invite link logged instead of email send.');
  console.log(`  - to: ${executorEmail}`);
  console.log(`  - inviteLink: ${verificationUrl}`);
  console.log('  - note: configure SMTP_* vars in .env to send real emails.');

  return {
    delivered: false,
    verificationUrl
  };
}

module.exports = {
  getExecutorVerificationUrl,
  sendExecutorVerificationEmail
};
