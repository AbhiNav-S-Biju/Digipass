# 🚨 SECURITY INCIDENT RESPONSE PLAN - VERCEL HACK

## Critical Timeline
- **Incident**: Vercel deployment compromised
- **Status**: ACTIVE ROTATION REQUIRED
- **Priority**: P0 - CRITICAL

---

## ⚠️ COMPROMISED CREDENTIALS (Must Rotate NOW)

### 1. Gmail App Password
**Status**: ❌ COMPROMISED
```
Old (INVALID): gdij ycdr ryaa jfxh
Location: .env file (exposed to GitHub)
Risk: Anyone can send emails as your account
```

**Action Items**:
- [ ] Go to myaccount.google.com → Security
- [ ] Find "App Passwords" 
- [ ] Revoke the old password
- [ ] Generate NEW app password
- [ ] Update .env.production on Render dashboard

---

### 2. Neon Database Password
**Status**: ❌ COMPROMISED
```
Old (INVALID): npg_tpdL7iFko4xE
Database: neondb
Host: ep-misty-field-amrcdzch.c-5.us-east-1.aws.neon.tech
Risk: Full database access compromised
```

**Action Items**:
- [ ] Go to console.neon.tech
- [ ] Select project
- [ ] Settings → Database → Change password
- [ ] Copy new password
- [ ] Update DB_PASSWORD on Render
- [ ] Restart Render server

---

### 3. JWT Secret
**Status**: ⚠️ WEAK - NEEDS ROTATION
```
Old: your-super-secret-key-change-this-in-production
Risk: All JWT tokens could be forged
```

**Action Items**:
- [ ] Generate new strong secret
- [ ] Update JWT_SECRET on Render
- [ ] All existing user sessions will need to re-login (expected)

---

### 4. GitHub Access
**Status**: ⚠️ NEEDS AUDIT
```
Risk: Credentials exposed in repository history
```

**Action Items**:
- [ ] Review GitHub personal access tokens
- [ ] Rotate all GitHub tokens
- [ ] Consider revoking Vercel GitHub integration
- [ ] Remove .env from git history

---

## 🔄 Step-by-Step Rotation Procedure

### STEP 1: Generate New Credentials

#### 1A. New Gmail App Password
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Left sidebar → **Security**
3. Scroll down → **App passwords**
4. Select "Mail" and "Windows Computer"
5. Google generates new 16-char password
6. **Copy and save securely**

#### 1B. New Neon Database Password
1. Go to [console.neon.tech](https://console.neon.tech)
2. Select your project
3. **Settings** → **Database**
4. Find password section
5. Click **Reset password**
6. Confirm action
7. **Copy new password** (only shown once!)
8. **Save securely**

#### 1C. Generate New JWT Secret
```bash
# Run this to generate a secure random secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
**Output**: Copy the 64-character hex string

#### 1D. Rotate GitHub Token
1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Personal access tokens** → **Tokens (classic)**
3. For each token:
   - Click **Regenerate**
   - Copy new token
   - Save securely
4. Update any services using old tokens

---

### STEP 2: Update Render Environment Variables

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Select **digipass-api** service
3. Click **Environment**
4. Update these variables:

```
DB_PASSWORD=<NEW_PASSWORD_FROM_NEON>
SMTP_PASS=<NEW_GMAIL_APP_PASSWORD>
JWT_SECRET=<NEW_JWT_SECRET>
GITHUB_TOKEN=<NEW_GITHUB_TOKEN> (if applicable)
```

5. Click **Save** (will auto-deploy)
6. Monitor logs for successful restart

---

### STEP 3: Verify Database Connection

```bash
# After updating, check server logs on Render
# You should see:
# ✅ DIGIPASS API running on port 3000
# ✓ Database initialization complete

# Test health endpoint
curl https://digipass-3l63.onrender.com/api/health
```

---

### STEP 4: Remove Secrets from Git History

This is critical - .env file with credentials is in git history.

#### Option A: Remove file from history (Recommended)
```bash
# Install BFG Repo Cleaner
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Clean history
bfg --delete-files .env .env.production

# Force push
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --mirror --force
```

#### Option B: Force push new history
```bash
# Remove file from current commit
git rm --cached .env .env.production
git commit --amend

# Force push (WARNING: rewrites history)
git push --force-with-lease origin main
```

---

### STEP 5: Update Local Development

**Create `.env.local` for development (never commit)**:
```
PORT=3000
NODE_ENV=development
JWT_SECRET=<NEW_SECRET>
CORS_ORIGIN=http://localhost:8080,http://localhost:3000
APP_BASE_URL=http://localhost:8080

# Local database (if using local Postgres)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_local_password
DB_NAME=digipass

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=abhinavbijusn@gmail.com
SMTP_PASS=<NEW_GMAIL_APP_PASSWORD>
EMAIL_FROM=abhinavbijusn@gmail.com

DISABLE_RATE_LIMIT=true
```

---

### STEP 6: Update .gitignore

Make sure these files are NEVER committed:
```bash
# .gitignore
.env
.env.local
.env.production
.env.*.local
.env.*.production
```

---

### STEP 7: Test All Services

1. **Test Email Sending**
   ```bash
   node test-mail.js
   # Should send test email successfully
   ```

2. **Test Database Connection**
   ```bash
   npm start
   # Check logs for successful DB initialization
   ```

3. **Test User Registration** (via app)
   - Go to your frontend
   - Create new account
   - Should receive verification email

4. **Test Executor Email** (via app)
   - Add executor
   - Should receive verification email

---

## 🔒 Security Hardening Checklist

After rotation, implement these security measures:

### Code Level
- [ ] Never hardcode secrets
- [ ] Use environment variables for all credentials
- [ ] Use `.env` only for local development
- [ ] Use `.env.example` with placeholder values in git

### Git Level
- [ ] Ensure `.env*` is in `.gitignore`
- [ ] Use secret scanning: `git log -p` to verify no secrets in history
- [ ] Set up GitHub secret scanning in repo settings
- [ ] Enable branch protection rules

### Deployment Level
- [ ] Store all secrets in Render Dashboard (not in git)
- [ ] Store all secrets in Vercel Dashboard
- [ ] Use separate credentials for dev/staging/prod
- [ ] Enable audit logging on all services

### Application Level
- [ ] Implement secret rotation schedule (quarterly)
- [ ] Log all authentication attempts
- [ ] Monitor for suspicious activity
- [ ] Use HTTPS everywhere
- [ ] Enable CORS restrictions
- [ ] Implement rate limiting
- [ ] Add request signing for sensitive operations

### Third-Party Level
- [ ] Enable 2FA on Gmail account
- [ ] Enable 2FA on GitHub account
- [ ] Enable 2FA on Render account
- [ ] Enable 2FA on Neon account
- [ ] Review connected applications

---

## 📋 Post-Incident Verification

After completing all steps:

1. **Verify No Old Credentials Work**
   ```bash
   # Try old database password (should fail)
   psql -h ep-misty-field-amrcdzch.c-5.us-east-1.aws.neon.tech \
        -U neondb_owner -d neondb -W
   # Enter old password: npg_tpdL7iFko4xE
   # Should show: FATAL: password authentication failed
   ```

2. **Verify New Credentials Work**
   - Server starts successfully
   - Database queries work
   - Emails send
   - API endpoints respond

3. **Audit Access Logs**
   - Check Render logs for anomalies
   - Check Neon logs for unusual queries
   - Check GitHub activity for suspicious access

4. **Notify Users** (Optional but Recommended)
   - Send email: "We've enhanced security measures"
   - Suggest password reset (optional)
   - Inform about new 2FA setup

---

## 🛡️ Prevent Future Incidents

### Use GitHub Secret Scanning
1. Go to repo Settings
2. Code security and analysis
3. Enable "Secret scanning" and "Push protection"

### Use Environment Variable Best Practices
**Good**:
```javascript
// Use process.env with fallbacks
const secret = process.env.JWT_SECRET || 'dev-fallback-change-in-prod';
```

**Bad**:
```javascript
// Never hardcode
const secret = 'your-actual-secret-key';

// Never log secrets
console.log('Secret:', secret);
```

### Use Secrets Management Tools
- **Option 1**: Render Environment Variables (what you're using)
- **Option 2**: HashiCorp Vault
- **Option 3**: AWS Secrets Manager
- **Option 4**: Azure Key Vault

---

## ✅ Completion Checklist

- [ ] Generated new Gmail app password
- [ ] Rotated Neon database password
- [ ] Generated new JWT secret
- [ ] Rotated GitHub token
- [ ] Updated Render environment variables
- [ ] Verified database connection works
- [ ] Removed secrets from git history
- [ ] Updated local .env.local
- [ ] Verified .gitignore has .env entries
- [ ] Tested all services (email, DB, API)
- [ ] Audited GitHub/Render logs
- [ ] Enabled secret scanning on GitHub
- [ ] Documented new credentials securely
- [ ] Set calendar reminder for quarterly rotation

---

## 📞 Emergency Contacts

If you notice any suspicious activity:

1. **Render Support**: [render.com/support](https://render.com/support)
2. **Neon Support**: [neon.tech/docs](https://neon.tech/docs)
3. **GitHub Security**: [github.com/settings/security](https://github.com/settings/security)
4. **Google Security**: [myaccount.google.com/security-checkup](https://myaccount.google.com/security-checkup)

---

## 🔐 Secure Credential Storage

For future reference, store your new credentials SAFELY:

**Option 1: Password Manager** (Recommended)
- Use 1Password, LastPass, or Bitwarden
- Store: Database password, JWT secret, API keys
- Enable family/team sharing if needed

**Option 2: Encrypted File** (Local Only)
- Create encrypted text file with new credentials
- Store in secure location (NOT in project)
- Never share or commit

**Option 3: Notes Document**
- Create private document (Google Drive, Notion)
- Use restricted sharing (only you access)
- Enable 2FA on account

---

## 📝 Document Version

- **Version**: 1.0
- **Created**: April 20, 2026
- **Status**: CRITICAL - ACTION REQUIRED
- **Author**: Security Response

---

**🔴 DO NOT proceed with normal development until rotation is complete.**

**All credentials listed above are VOID and should be regenerated immediately.**
