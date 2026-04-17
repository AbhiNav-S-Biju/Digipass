require('dotenv').config();
const nodemailer = require('nodemailer');

async function testMail() {
  const secure = String(process.env.SMTP_SECURE || 'false') === 'true';
  const port = Number(process.env.SMTP_PORT || (secure ? 465 : 587));
  const to = process.env.TEST_EMAIL_TO || process.env.EMAIL_FROM || process.env.SMTP_USER;

  console.log('[Test Mail] Loaded configuration:');
  console.log(`  - SMTP_HOST: ${process.env.SMTP_HOST || '(missing)'}`);
  console.log(`  - SMTP_PORT: ${port}`);
  console.log(`  - SMTP_SECURE: ${secure}`);
  console.log(`  - SMTP_USER loaded: ${Boolean(process.env.SMTP_USER)}`);
  console.log(`  - SMTP_PASS loaded: ${Boolean(process.env.SMTP_PASS)}`);
  console.log(`  - EMAIL_FROM: ${process.env.EMAIL_FROM || '(missing)'}`);
  console.log(`  - TEST_EMAIL_TO: ${to || '(missing)'}`);

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !to) {
    throw new Error('SMTP_HOST, SMTP_USER, SMTP_PASS, and TEST_EMAIL_TO/EMAIL_FROM must be configured.');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    logger: true,
    debug: true,
    requireTLS: !secure,
    tls: {
      minVersion: 'TLSv1.2'
    }
  });

  console.log('[Test Mail] Verifying transporter...');
  await transporter.verify();
  console.log('[Test Mail] Transporter verified.');

  console.log('[Test Mail] Sending email...');
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject: 'DIGIPASS SMTP Test',
    text: 'This is a DIGIPASS SMTP test email.',
    html: '<p>This is a <strong>DIGIPASS</strong> SMTP test email.</p>'
  });

  console.log('[Test Mail] Email sent successfully.');
  console.log(`  - messageId: ${info.messageId}`);
  console.log(`  - accepted: ${info.accepted.join(', ') || '(none)'}`);
  console.log(`  - rejected: ${info.rejected.join(', ') || '(none)'}`);
}

testMail().catch((error) => {
  console.error('[Test Mail] Failed.');
  console.error(`  - message: ${error.message}`);
  console.error(`  - code: ${error.code || '(none)'}`);
  console.error(`  - response: ${error.response || '(none)'}`);
  console.error(`  - command: ${error.command || '(none)'}`);
  process.exit(1);
});
