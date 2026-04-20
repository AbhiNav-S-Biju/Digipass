# 🚨 SECURITY INCIDENT - IMMEDIATE ACTION PLAN

**Status**: CRITICAL - Vercel Compromised  
**Date**: April 20, 2026  
**Severity**: P0 - CRITICAL  

---

## ⚡ URGENT: Next 1 Hour

### Step 1: Disable Compromised Gmail Password
1. Go to: https://myaccount.google.com/security
2. Look for "App passwords" or "Less secure app access"
3. **REVOKE** the password: `gdij ycdr ryaa jfxh`
4. Do NOT delete, just revoke it
5. This immediately stops anyone using the old password

**Time**: 5 minutes  
**Risk**: 🔴 CRITICAL

---

### Step 2: Disable Compromised Database Password
1. Go to: https://console.neon.tech
2. Select your project
3. Settings → Database
4. Reset password (this invalidates old password)
5. Copy the new password (shown only once!)
6. **Save to secure password manager**

**Time**: 5 minutes  
**Risk**: 🔴 CRITICAL

---

### Step 3: Generate New JWT Secret
Run this command:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output - this is your new JWT_SECRET

**Time**: 2 minutes  
**Risk**: 🔴 CRITICAL

---

### Step 4: Rotate GitHub Token
1. Go to: https://github.com/settings/tokens
2. Click "Tokens (classic)"
3. Find any tokens used for this project
4. Click "Regenerate" on each one
5. Save new tokens to password manager

**Time**: 5 minutes  
**Risk**: 🔴 CRITICAL

---

### Step 5: Update Render Environment Variables

1. Go to: https://dashboard.render.com
2. Select **digipass-api** service
3. Click **Environment** tab
4. Update these exact variables:

```
DB_PASSWORD = <NEW PASSWORD FROM NEON>
JWT_SECRET = <NEW JWT_SECRET YOU GENERATED>
SMTP_PASS = <GENERATE NEW GMAIL APP PASSWORD BELOW>
GITHUB_TOKEN = <NEW GITHUB TOKEN IF NEEDED>
```

5. Click **Save** button
6. Wait for automatic deployment

**Time**: 10 minutes

---

### Step 6: Generate New Gmail App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Google generates new 16-character password
4. Copy it exactly (spaces included)
5. Update SMTP_PASS in Render (Step 5)

**Time**: 5 minutes

---

## ✅ FIRST HOUR CHECKLIST

- [ ] Revoked old Gmail password
- [ ] Reset Neon database password
- [ ] Generated new JWT secret
- [ ] Rotated GitHub token
- [ ] Updated Render environment variables
- [ ] Generated new Gmail app password
- [ ] Verified Render server restarted successfully

---

## ⚙️ NEXT: Cleanup Git History (1-2 Hours)

**Why**: .env with credentials is in git history  
**What**: Remove these files from git history permanently

### Option A: Using BFG Repo Cleaner (Recommended)

1. Download BFG: https://rtyley.github.io/bfg-repo-cleaner/

2. Run command:
```bash
cd /path/to/Digipass
bfg --delete-files .env .env.production
bfg --replace-text passwords.txt
```

3. Force push:
```bash
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --mirror --force
```

### Option B: Manual History Rewrite

```bash
# This will rewrite ALL history (more complex)
# Only do this if comfortable with git
git filter-branch --tree-filter 'rm -f .env .env.production' -- --all
git push --force-with-lease origin main
```

---

## 🔍 VERIFY: Everything Works (30 minutes)

### Test 1: Database Connection
```bash
npm start
# Check logs for: ✓ Database initialization complete
```

### Test 2: Email Sending
```bash
npm run test:email
# Should receive test email in inbox
```

### Test 3: User Registration
1. Go to your app
2. Create new account
3. Check email for verification
4. If you receive email → ✅ Working

### Test 4: Executor Verification
1. Add executor from dashboard
2. Check executor's email for verification
3. If they receive email → ✅ Working

---

## 📝 Documentation & Security

Created files to help you:

1. **SECURITY_INCIDENT_RESPONSE.md**
   - Complete incident response playbook
   - Step-by-step rotation instructions
   - Verification procedures
   - Prevention measures

2. **.env.example**
   - Template for environment variables
   - Never commit real credentials
   - Share this with team for setup

3. **detect-secrets.js**
   - Scans git history for exposed secrets
   - Run: `node detect-secrets.js`
   - Confirms credentials still exposed

4. **audit-sensitive-vars.js**
   - Lists all sensitive variables
   - Shows risk levels
   - Best practices guide
   - Run: `node audit-sensitive-vars.js`

---

## 🔐 LONG-TERM: Prevent Future Incidents

### 1. Enable GitHub Secret Scanning
1. Go to: https://github.com/AbhiNav-S-Biju/Digipass
2. Settings → Code security and analysis
3. Enable "Secret scanning" ✅
4. Enable "Push protection" ✅

### 2. Enable GitHub Dependabot
1. Same settings location
2. Enable "Dependabot alerts" ✅
3. Enable "Dependabot updates" ✅

### 3. Update Local Development
Create `.env.local` (never commit):
```
PORT=3000
NODE_ENV=development
JWT_SECRET=your-new-secret
DB_PASSWORD=your-local-password
SMTP_PASS=your-new-gmail-password
... (rest of vars)
```

### 4. Set Quarterly Reminder
- Gmail: Set calendar reminder for quarterly password rotation
- GitHub: Same
- Database: Same
- Render: Audit credentials quarterly

---

## 📞 Quick Reference

**If something breaks:**

1. Check Render logs: https://dashboard.render.com
2. Check syntax of environment variables (no extra spaces)
3. Verify database can be reached
4. Verify Gmail credentials work
5. Check CORS settings

**Emergency contact:**
- Render Support: https://render.com/support
- Neon Support: https://neon.tech/docs
- GitHub: https://github.com/support

---

## 🎯 Success Criteria

When everything is done:
- ✅ Old credentials don't work (confirmed)
- ✅ New credentials work in production
- ✅ Email sending works
- ✅ User registration/login works
- ✅ Database queries work
- ✅ Git history cleaned
- ✅ Secret scanning enabled on GitHub
- ✅ All team members informed

---

## 📋 Complete Checklist

**CRITICAL (Do now):**
- [ ] Disable old Gmail password
- [ ] Reset database password
- [ ] Generate new JWT secret
- [ ] Rotate GitHub token
- [ ] Update Render env vars
- [ ] Verify server restarted

**Important (Next 2 hours):**
- [ ] Clean git history
- [ ] Test all integrations
- [ ] Verify no 403/401 errors
- [ ] Run secret detection scan

**Soon (Next 24 hours):**
- [ ] Enable GitHub secret scanning
- [ ] Update team on incident
- [ ] Document what happened
- [ ] Create prevention procedures
- [ ] Set rotation reminders

**Long-term:**
- [ ] Quarterly credential rotation
- [ ] Monthly security audits
- [ ] Quarterly penetration testing
- [ ] Annual security review

---

**Remember**: You're not alone in this. Many projects have had credential leaks.  
What matters is that you responded quickly and thoroughly. ✅

Good luck! You've got this! 💪

---

**Questions?** Check:
- SECURITY_INCIDENT_RESPONSE.md (detailed guide)
- PROJECT_DOCUMENTATION.md (how things work)
- audit-sensitive-vars.js (what to protect)
