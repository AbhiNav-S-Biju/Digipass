#!/usr/bin/env node
/**
 * Git Secret Detector
 * Scans git history for exposed credentials
 * Run: node detect-secrets.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SENSITIVE_PATTERNS = [
  {
    name: 'Gmail App Password',
    pattern: /SMTP_PASS=([a-z\s]{16})/gi,
  },
  {
    name: 'JWT Secret (non-example)',
    pattern: /JWT_SECRET=([^your][\w\-]{20,})/gi,
  },
  {
    name: 'Database Password',
    pattern: /DB_PASSWORD=([a-z0-9_]{10,})/gi,
  },
  {
    name: 'Neon Password Token',
    pattern: /(npg_[a-zA-Z0-9]{20,})/g,
  },
  {
    name: 'API Key Pattern',
    pattern: /(sk_[a-zA-Z0-9_]{20,}|pk_[a-zA-Z0-9_]{20,})/g,
  },
  {
    name: 'GitHub Token',
    pattern: /(ghp_[a-zA-Z0-9]{36})/g,
  },
  {
    name: '.env files',
    pattern: /\.env/gi,
  },
];

function scanGitHistory() {
  console.log('🔍 Scanning git history for exposed secrets...\n');
  
  try {
    // Get all commits
    const commits = execSync('git log --oneline --all', { encoding: 'utf-8' })
      .split('\n')
      .filter(l => l.trim());
    
    let foundSecrets = 0;
    
    commits.forEach((commit, index) => {
      const hash = commit.split(' ')[0];
      
      try {
        // Get full diff for each commit
        const diff = execSync(`git show ${hash}`, { encoding: 'utf-8' });
        
        SENSITIVE_PATTERNS.forEach(({ name, pattern }) => {
          if (pattern.test(diff)) {
            console.log(`⚠️  FOUND: ${name}`);
            console.log(`   Commit: ${hash}`);
            console.log(`   Message: ${commit.substring(7)}\n`);
            foundSecrets++;
          }
        });
      } catch (err) {
        // Skip commits that can't be accessed
      }
    });
    
    if (foundSecrets === 0) {
      console.log('✅ No obvious secrets found in recent history\n');
    } else {
      console.log(`\n❌ Found ${foundSecrets} potential secret exposures!\n`);
      console.log('ACTION REQUIRED: Run git-secret-purge.js to clean history\n');
    }
  } catch (err) {
    console.error('Error scanning history:', err.message);
  }
}

function checkCurrentFiles() {
  console.log('📂 Checking current files for secrets...\n');
  
  const filesToCheck = ['.env', '.env.production', '.env.staging'];
  
  filesToCheck.forEach(filename => {
    const filepath = path.join(process.cwd(), filename);
    if (fs.existsSync(filepath)) {
      const content = fs.readFileSync(filepath, 'utf-8');
      
      SENSITIVE_PATTERNS.forEach(({ name, pattern }) => {
        if (pattern.test(content)) {
          console.log(`❌ ${filename}: Contains ${name}`);
        }
      });
    }
  });
  
  console.log('\n✅ File check complete\n');
}

console.log('═'.repeat(50));
console.log('🔐 DIGIPASS - Secret Detection Utility');
console.log('═'.repeat(50) + '\n');

scanGitHistory();
checkCurrentFiles();

console.log('═'.repeat(50));
console.log('📋 NEXT STEPS:');
console.log('═'.repeat(50));
console.log(`
1. If secrets found, immediately rotate them:
   - Gmail: myaccount.google.com/apppasswords
   - Neon: console.neon.tech → Settings → Database
   - JWT: Generate new secret (see docs)

2. Clean git history:
   npm run clean-git-secrets

3. Push cleaned repository:
   git push --force-with-lease origin main

4. Verify cleanup:
   npm run detect-secrets
`);
