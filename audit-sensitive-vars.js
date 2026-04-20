#!/usr/bin/env node
/**
 * Sensitive Variables Audit
 * Lists all environment variables that should be treated as sensitive
 * Shows best practices for handling each one
 */

const sensitiveVars = [
  {
    name: 'JWT_SECRET',
    purpose: 'Sign and verify JWT authentication tokens',
    risk: 'CRITICAL - Anyone can forge user sessions',
    rotation: 'Quarterly or on suspicion of compromise',
    storage: 'Render/Vercel env vars (NEVER in git)',
    example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    length: '32+ characters (preferably 64)',
  },
  {
    name: 'DB_PASSWORD',
    purpose: 'PostgreSQL/Neon database authentication',
    risk: 'CRITICAL - Full database access',
    rotation: 'Immediately on compromise, then quarterly',
    storage: 'Render env var (NEVER in code)',
    example: 'abc123xyz789def456ghi',
    length: '16+ characters',
  },
  {
    name: 'DB_HOST',
    purpose: 'Neon database server address',
    risk: 'HIGH - Exposes infrastructure',
    rotation: 'Not needed unless changing databases',
    storage: 'Can be in .env for local dev',
    example: 'ep-xxxxx.neon.tech',
    length: 'Variable',
  },
  {
    name: 'SMTP_PASS',
    purpose: 'Gmail app password for email sending',
    risk: 'CRITICAL - Can send emails as you',
    rotation: 'Immediately on compromise',
    storage: 'Render env var (NEVER in code)',
    example: 'abcd efgh ijkl mnop',
    length: '16 characters (4 groups of 4)',
  },
  {
    name: 'SMTP_USER',
    purpose: 'Gmail account email address',
    risk: 'LOW - Semi-public, but needed for reference',
    rotation: 'Not needed',
    storage: 'Can be in .env',
    example: 'your-email@gmail.com',
    length: 'Variable',
  },
  {
    name: 'RESEND_API_KEY',
    purpose: 'Third-party email service (if using)',
    risk: 'CRITICAL - Can send emails',
    rotation: 'Immediately on compromise',
    storage: 'Render/Vercel env var (NEVER in git)',
    example: 're_xxxxxxxxxxxx',
    length: '30+ characters',
  },
  {
    name: 'GITHUB_TOKEN',
    purpose: 'GitHub API access (optional)',
    risk: 'CRITICAL - Full GitHub access',
    rotation: 'Immediately on compromise',
    storage: 'Render env var (NEVER in git)',
    example: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    length: '40 characters',
  },
  {
    name: 'CORS_ORIGIN',
    purpose: 'Allowed frontend domains',
    risk: 'MEDIUM - Controls who can access API',
    rotation: 'As needed for deployment changes',
    storage: 'Can be in .env, separate for each env',
    example: 'https://yourapp.vercel.app,http://localhost:3000',
    length: 'Variable',
  },
];

console.log('═'.repeat(70));
console.log('🔐 DIGIPASS - Sensitive Environment Variables Audit');
console.log('═'.repeat(70) + '\n');

console.log('📋 CRITICAL VARIABLES (Must be rotated immediately)\n');

const critical = sensitiveVars.filter(v => 
  v.risk.includes('CRITICAL')
);

critical.forEach((v, i) => {
  console.log(`${i + 1}. ${v.name}`);
  console.log(`   Purpose: ${v.purpose}`);
  console.log(`   Risk Level: ${v.risk}`);
  console.log(`   Rotation: ${v.rotation}`);
  console.log(`   Storage: ${v.storage}`);
  console.log(`   Example: ${v.example}`);
  console.log(`   Length: ${v.length}`);
  console.log('');
});

console.log('─'.repeat(70));
console.log('⚠️  HIGH RISK VARIABLES (Should be monitored)\n');

const high = sensitiveVars.filter(v => 
  v.risk.includes('HIGH') && !v.risk.includes('CRITICAL')
);

high.forEach((v, i) => {
  console.log(`${i + 1}. ${v.name}`);
  console.log(`   Purpose: ${v.purpose}`);
  console.log(`   Risk Level: ${v.risk}`);
  console.log(`   Storage: ${v.storage}`);
  console.log('');
});

console.log('─'.repeat(70));
console.log('📋 ALL VARIABLES\n');

sensitiveVars.forEach((v, i) => {
  const icon = v.risk.includes('CRITICAL') ? '🔴' : 
               v.risk.includes('HIGH') ? '🟠' : '🟡';
  console.log(`${icon} ${i + 1}. ${v.name.padEnd(20)} - ${v.risk}`);
});

console.log('\n' + '═'.repeat(70));
console.log('✅ BEST PRACTICES\n');

const practices = [
  '1. NEVER commit .env files with real credentials',
  '2. ALWAYS use Render Dashboard for production env vars',
  '3. ALWAYS use Vercel Dashboard for frontend env vars',
  '4. Use .env.example template with placeholder values',
  '5. Create separate env vars for dev/staging/production',
  '6. Rotate sensitive credentials quarterly',
  '7. Enable GitHub secret scanning',
  '8. Enable 2FA on all accounts (Gmail, GitHub, Render, Neon)',
  '9. Use strong, unique passwords for each service',
  '10. Log and monitor all credential access attempts',
];

practices.forEach(p => {
  console.log(`   ${p}`);
});

console.log('\n' + '═'.repeat(70));
console.log('🔄 ROTATION SCHEDULE\n');

const schedule = {
  'JWT_SECRET': '3 months or on compromise',
  'DB_PASSWORD': '3 months or on compromise',
  'SMTP_PASS': '3 months or on compromise',
  'RESEND_API_KEY': '3 months or on compromise',
  'GITHUB_TOKEN': '6 months or on compromise',
  'Other credentials': 'As needed',
};

Object.entries(schedule).forEach(([key, value]) => {
  console.log(`   ${key.padEnd(20)} → ${value}`);
});

console.log('\n' + '═'.repeat(70));
console.log('🛡️  INCIDENT RESPONSE\n');

const responses = [
  '1. Immediately disable compromised credentials',
  '2. Rotate to new credentials immediately',
  '3. Update all services with new credentials',
  '4. Clean git history to remove old credentials',
  '5. Audit logs for suspicious access',
  '6. Notify team/users of incident',
  '7. Document what happened and lessons learned',
  '8. Update security processes to prevent recurrence',
];

responses.forEach(r => {
  console.log(`   ${r}`);
});

console.log('\n' + '═'.repeat(70) + '\n');
