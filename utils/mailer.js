const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');
const { getExecutorVerificationUrl } = require('./qrCode');

let sendgridInitialized = false;
let smtpTransport = null;

function initSendGrid() {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (apiKey) {
    sgMail.setApiKey(apiKey);
    sendgridInitialized = true;
    console.log('[Mailer] SendGrid ready');
  } else {
    console.warn('[Mailer] SENDGRID_API_KEY not configured.');
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    smtpTransport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    console.log('[Mailer] SMTP fallback ready');
  }
  if (process.env.RESEND_API_KEY) {
    console.log('[Mailer] Resend fallback ready');
  }

  return sendgridInitialized || Boolean(smtpTransport) || Boolean(process.env.RESEND_API_KEY);
}

function invitationHtml(executorName, verificationUrl) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a2e22;">
      <h2 style="color:#1b3a2d;">DIGIPASS Executor Invitation</h2>
      <p>Hello ${executorName},</p>
      <p>You have been invited to register as an executor in DIGIPASS.</p>
      <p>Click the button below to verify your email and create your executor account:</p>
      <p>
        <a href="${verificationUrl}" style="display:inline-block;padding:12px 18px;background:#1b3a2d;color:#fdf6ec;text-decoration:none;border-radius:999px;">
          Verify and register
        </a>
      </p>
      <p>If the button does not work, use this link:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>This link expires in 24 hours.</p>
    </div>
  `;
}

// Each provider returns { delivered, provider, messageId } or throws with a readable message.
async function viaSendGrid(msg) {
  const response = await sgMail.send(msg);
  return { delivered: true, provider: 'sendgrid', statusCode: response[0].statusCode, messageId: response[0].headers['x-message-id'] };
}

async function viaSmtp(msg) {
  const info = await smtpTransport.sendMail({ from: msg.from, to: msg.to, subject: msg.subject, html: msg.html });
  return { delivered: true, provider: 'smtp', messageId: info.messageId };
}

async function viaResend(msg) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: msg.from, to: [msg.to], subject: msg.subject, html: msg.html })
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || `Resend error ${res.status}`);
  return { delivered: true, provider: 'resend', messageId: body.id };
}

function providerError(error) {
  return error.response?.body?.errors?.[0]?.message || error.message || 'unknown error';
}

/**
 * Send the executor invitation. Tries SendGrid, then SMTP, then Resend, so one
 * provider running out of credits does not block invitations. Never throws:
 * when every provider fails, the caller gets delivered:false plus the link so
 * the owner can share it another way.
 */
async function sendExecutorVerificationEmail({ executorName, executorEmail, token }) {
  const verificationUrl = getExecutorVerificationUrl(token);
  const msg = {
    to: executorEmail,
    from: process.env.EMAIL_FROM || 'noreply@digipass.com',
    subject: 'DIGIPASS Executor Invitation',
    html: invitationHtml(executorName, verificationUrl)
  };

  const providers = [];
  if (sendgridInitialized && process.env.SENDGRID_API_KEY) providers.push(['SendGrid', viaSendGrid]);
  if (smtpTransport) providers.push(['SMTP', viaSmtp]);
  if (process.env.RESEND_API_KEY) providers.push(['Resend', viaResend]);

  if (!providers.length) {
    console.warn(`[Email] Not sent to ${executorEmail}: no email provider configured`);
    return { delivered: false, verificationUrl, reason: 'No email provider is configured' };
  }

  const failures = [];
  for (const [name, send] of providers) {
    try {
      const result = await send(msg);
      console.log(`[Email] Sent executor verification to ${executorEmail} via ${name}`);
      return { ...result, verificationUrl };
    } catch (error) {
      const reason = providerError(error);
      console.error(`[Email] ${name} failed for ${executorEmail}: ${reason}`);
      failures.push(`${name}: ${reason}`);
    }
  }

  return { delivered: false, verificationUrl, reason: failures.join('; ') };
}

module.exports = {
  initSendGrid,
  getExecutorVerificationUrl,
  sendExecutorVerificationEmail
};
