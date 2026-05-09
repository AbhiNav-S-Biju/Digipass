# 🎯 DIGIPASS - Complete Algorithm & Workflow Documentation

**Project Name:** DIGIPASS - Digital Estate Management System  
**Version:** 1.0  
**Last Updated:** May 3, 2026

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Core Algorithms](#core-algorithms)
5. [Data Flow Diagrams](#data-flow-diagrams)
6. [Module Workflows](#module-workflows)
7. [Database Schema](#database-schema)
8. [API Endpoints](#api-endpoints)
9. [Security Algorithms](#security-algorithms)
10. [Real-World Workflow Scenarios](#real-world-workflow-scenarios)

---

## 1. System Overview

### Purpose
DIGIPASS is a **Digital Estate Management System** designed to:
- Allow users to securely store and manage digital asset credentials
- Designate executors to handle their digital estate after incapacity/death
- Generate digital wills documenting all assets and instructions
- Implement "Dead Man's Switch" for automatic asset transfer
- Provide executors with secure access to digital assets

### Key Features
1. **User Authentication** - Secure login/registration with JWT tokens
2. **Digital Assets Management** - Store credentials for emails, bank accounts, social media, etc.
3. **Executor Portal** - Dedicated interface for designated executors to view assets
4. **Digital Will Generation** - Automatic PDF will creation with asset details
5. **Dead Man's Switch** - Automatic notification/trigger after user inactivity
6. **Activity Audit Log** - Track all system actions for compliance
7. **Grant/Revoke Access** - Owner controls executor access to assets

---

## 2. Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Vercel Deployment (https://digipass-pi.vercel.app)     │   │
│  │ - register.html (public)                                │   │
│  │ - login.html (public)                                   │   │
│  │ - dashboard.html (protected - authenticated users)      │   │
│  │ - executor-login.html (public)                          │   │
│  │ - executor-dashboard.html (protected - executors only)  │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ HTTP/HTTPS Requests
                 │ JWT Bearer Tokens
                 │
┌────────────────▼────────────────────────────────────────────────┐
│                      BACKEND LAYER                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Express.js Server (Render: https://digipass-3l63      │   │
│  │  .onrender.com)                                         │   │
│  │  Port: 3000                                             │   │
│  │                                                         │   │
│  │  Routes:                                                │   │
│  │  - /api/auth/*        (authentication)                  │   │
│  │  - /api/assets/*      (digital assets CRUD)             │   │
│  │  - /api/executors/*   (executor management)             │   │
│  │  - /api/will/*        (will generation)                 │   │
│  │  - /api/dead-mans-switch/* (check-in & status)          │   │
│  │  - /api/activity/*    (audit logs)                      │   │
│  │  - /api/executor-portal/* (executor view)               │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ SQL Queries (parameterized)
                 │ Connection Pooling
                 │
┌────────────────▼────────────────────────────────────────────────┐
│                   DATABASE LAYER                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  PostgreSQL via Neon (Serverless)                       │   │
│  │  ep-misty-field-amrcdzch.c-5.us-east-1.aws.neon.tech   │   │
│  │  Port: 5432                                             │   │
│  │                                                         │   │
│  │  Tables:                                                │   │
│  │  - users                                                │   │
│  │  - digital_assets                                       │   │
│  │  - executors                                            │   │
│  │  - digital_will                                         │   │
│  │  - dead_mans_switch                                     │   │
│  │  - user_activity                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

### Frontend
- **HTML5** - Page structure
- **CSS3** - Styling with custom color palette (DIGIPASS colors)
- **JavaScript (ES6+)** - Client-side logic
- **Bootstrap 5** - Responsive UI framework
- **Font Awesome 6.4** - Icons
- **Deployment:** Vercel

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **pg module** - PostgreSQL client
- **jsonwebtoken** - JWT token generation/verification
- **bcryptjs** - Password hashing (10 salt rounds)
- **nodemailer/resend** - Email notifications
- **node-cron** - Scheduled tasks (Dead Man's Switch)
- **pdfkit** - PDF generation for wills
- **Deployment:** Render

### Development
- **dotenv** - Environment variable management
- **nodemon** - Auto-restart on file changes

---

## 4. Core Algorithms

### 4.1 Authentication Algorithm

#### Registration Flow

```
USER INPUT
  ↓
[VALIDATION]
  ├─ Email format validation (regex)
  ├─ Password strength check (min 6 chars)
  ├─ Required fields present
  └─ Email uniqueness check (query database)
  ↓
[PASSWORD HASHING]
  ├─ bcrypt.genSalt(10) → Generate random salt
  ├─ bcrypt.hash(plaintext, salt) → Create hash
  └─ Hash stored in database (plaintext never stored)
  ↓
[USER RECORD CREATION]
  ├─ INSERT INTO users (full_name, email, password_hash, created_at)
  ├─ Get inserted user_id
  └─ Initialize dead_mans_switch record for user
  ↓
[TOKEN GENERATION]
  ├─ jwt.sign({ userId: user_id }, JWT_SECRET)
  ├─ Token expires in 7 days
  └─ Return token + user data to frontend
  ↓
[FRONTEND STORAGE]
  ├─ localStorage.setItem('token', token)
  └─ Redirect to dashboard
```

**Pseudocode:**
```javascript
async function register(fullName, email, password) {
    // Validate input
    if (!isValidEmail(email)) throw "Invalid email"
    if (password.length < 6) throw "Password too short"
    
    // Check email uniqueness
    const existing = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    )
    if (existing.rows.length > 0) throw "Email already registered"
    
    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
    
    // Create user
    const result = await pool.query(
        "INSERT INTO users (full_name, email, password_hash, created_at) 
         VALUES ($1, $2, $3, NOW()) RETURNING user_id",
        [fullName, email, hash]
    )
    const userId = result.rows[0].user_id
    
    // Generate token
    const token = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    )
    
    return { userId, fullName, email, token }
}
```

#### Login Flow

```
USER INPUT (email, password)
  ↓
[VALIDATION]
  ├─ Email format check
  └─ Both fields present
  ↓
[DATABASE LOOKUP]
  ├─ SELECT * FROM users WHERE email = $1
  └─ If not found → 401 (Unauthorized)
  ↓
[PASSWORD VERIFICATION]
  ├─ bcrypt.compare(inputPassword, storedHash)
  ├─ Compares with constant-time algorithm
  └─ If mismatch → 401 (Unauthorized)
  ↓
[TOKEN GENERATION]
  ├─ jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
  └─ Return token + user data
  ↓
[FRONTEND STORAGE]
  ├─ localStorage.setItem('token', token)
  └─ Redirect to dashboard
```

**Pseudocode:**
```javascript
async function login(email, password) {
    // Find user
    const result = await pool.query(
        "SELECT user_id, full_name, email, password_hash FROM users 
         WHERE email = $1",
        [email]
    )
    if (result.rows.length === 0) throw "User not found"
    
    const user = result.rows[0]
    
    // Verify password
    const isValidPassword = await bcrypt.compare(
        password,
        user.password_hash
    )
    if (!isValidPassword) throw "Invalid password"
    
    // Generate token
    const token = jwt.sign(
        { userId: user.user_id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    )
    
    return { userId: user.user_id, fullName: user.full_name, email: user.email, token }
}
```

#### Token Verification Algorithm

```
HTTP REQUEST with Authorization Header
  ↓
[EXTRACT TOKEN]
  ├─ Authorization: "Bearer <token>"
  └─ Split string and get token part
  ↓
[VERIFY SIGNATURE]
  ├─ jwt.verify(token, JWT_SECRET)
  ├─ Check HMAC signature matches
  └─ If invalid → 403 (Forbidden)
  ↓
[CHECK EXPIRATION]
  ├─ Check "exp" claim in JWT
  └─ If expired → 401 (Token expired)
  ↓
[EXTRACT USERID]
  ├─ Decode payload → { userId, iat, exp }
  └─ Set req.userId = userId
  ↓
[ALLOW REQUEST PROCESSING]
```

**Pseudocode:**
```javascript
async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader?.split(' ')[1]  // "Bearer token" → token
    
    if (!token) return res.status(401).json("No token provided")
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = decoded.userId
        next()
    } catch (error) {
        return res.status(403).json("Invalid or expired token")
    }
}
```

---

### 4.2 Digital Assets Management Algorithm

#### Add Asset Flow

```
USER INPUT (asset details)
  ↓
[VALIDATION]
  ├─ Required fields: platform_name, category, account_identifier, 
  │                   account_password, action_type
  ├─ action_type must be: 'pass', 'delete', or 'last_message'
  ├─ If 'last_message' → last_message field required
  └─ All strings trimmed of whitespace
  ↓
[DATABASE INSERT]
  ├─ INSERT INTO digital_assets (user_id, platform_name, category, 
  │   account_identifier, account_password, action_type, last_message, 
  │   created_at, updated_at)
  ├─ Parameterized query ($1, $2, $3, etc.) prevents SQL injection
  └─ Get inserted asset_id
  ↓
[ACTIVITY LOGGING]
  ├─ INSERT INTO user_activity (user_id, action_type, description, 
  │   entity_type, entity_id, created_at)
  ├─ action_type: 'asset_created'
  ├─ entity_type: 'asset'
  ├─ entity_id: newly created asset_id
  └─ Auto-timestamp set
  ↓
[RESPONSE]
  └─ Return asset details (201 Created)
```

**Pseudocode:**
```javascript
async function addAsset(userId, assetData) {
    const { platform_name, category, account_identifier, 
            account_password, action_type, last_message } = assetData
    
    // Validate
    if (!platform_name || !category || !account_identifier) {
        throw "Missing required fields"
    }
    if (!['pass', 'delete', 'last_message'].includes(action_type)) {
        throw "Invalid action_type"
    }
    if (action_type === 'last_message' && !last_message) {
        throw "last_message required for 'last_message' action"
    }
    
    // Insert asset
    const result = await pool.query(
        `INSERT INTO digital_assets 
         (user_id, platform_name, category, account_identifier, 
          account_password, action_type, last_message, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING asset_id, platform_name, category, account_identifier, 
                   action_type, last_message, created_at`,
        [userId, platform_name.trim(), category, account_identifier.trim(),
         account_password.trim(), action_type, last_message || null]
    )
    
    const asset = result.rows[0]
    
    // Log activity
    await logActivity(
        userId,
        'asset_created',
        `Asset created: ${platform_name}`,
        'asset',
        asset.asset_id
    )
    
    return asset
}
```

#### Get Assets Flow

```
AUTHENTICATED USER REQUEST
  ↓
[RETRIEVE USER'S ASSETS]
  ├─ SELECT * FROM digital_assets WHERE user_id = $1
  │          ORDER BY created_at DESC
  ├─ Users only see their own assets (enforced by user_id filter)
  └─ Ordered by newest first
  ↓
[FORMAT RESPONSE]
  ├─ Build response array with all asset fields
  ├─ Remove sensitive data if needed
  └─ Include pagination info (total, limit, offset)
  ↓
[RESPONSE]
  └─ Return asset array (200 OK)
```

**Pseudocode:**
```javascript
async function getAssets(userId) {
    const result = await pool.query(
        `SELECT asset_id, platform_name, category, account_identifier, 
                action_type, last_message, created_at, updated_at
         FROM digital_assets
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
    )
    
    return result.rows.map(asset => ({
        asset_id: asset.asset_id,
        platform_name: asset.platform_name,
        category: asset.category,
        account_identifier: asset.account_identifier,
        action_type: asset.action_type,
        last_message: asset.last_message,
        created_at: asset.created_at
    }))
}
```

#### Delete Asset Flow

```
AUTHENTICATED USER REQUEST with asset_id
  ↓
[VERIFY OWNERSHIP]
  ├─ SELECT user_id FROM digital_assets WHERE asset_id = $1
  ├─ Compare user_id with authenticated user's userId
  └─ If mismatch → 403 (Forbidden)
  ↓
[DELETE ASSET]
  ├─ DELETE FROM digital_assets WHERE asset_id = $1 AND user_id = $2
  └─ Verify 1 row deleted
  ↓
[ACTIVITY LOGGING]
  ├─ INSERT INTO user_activity with action_type: 'asset_deleted'
  └─ entity_id: deleted asset_id
  ↓
[RESPONSE]
  └─ Confirm deletion (200 OK)
```

---

### 4.3 Executor Management Algorithm

#### Add Executor Flow

```
USER INPUT (executor details)
  ↓
[VALIDATION]
  ├─ Required: executor_name, executor_email, executor_phone, relationship
  ├─ Email format validation
  ├─ Check executor_email not already assigned to this user
  └─ Phone format validation (optional)
  ↓
[GENERATE VERIFICATION TOKEN]
  ├─ crypto.randomBytes(32).toString('hex') → random token
  ├─ Hash token: bcrypt.hash(token, salt)
  ├─ Calculate expiration: now + 24 hours
  └─ Store hash in database (plaintext token sent via email only)
  ↓
[CREATE EXECUTOR RECORD]
  ├─ INSERT INTO executors (user_id, executor_name, executor_email, 
  │   executor_phone, relationship, verification_token_hash, 
  │   verification_token_expires_at, verification_status)
  ├─ verification_status = 'pending'
  ├─ access_granted = FALSE
  └─ created_at = NOW()
  ↓
[SEND VERIFICATION EMAIL (ASYNC)]
  ├─ Compose email with:
  │  ├─ Executor verification link
  │  ├─ Plain token (for one-time use)
  │  └─ 24-hour expiration warning
  ├─ Send via nodemailer/Resend
  ├─ Does NOT block response (async email)
  └─ Log if email fails (but don't block user response)
  ↓
[ACTIVITY LOGGING]
  └─ INSERT INTO user_activity with action_type: 'executor_added'
  ↓
[RESPONSE]
  └─ Return executor details (201 Created)
```

**Pseudocode:**
```javascript
async function addExecutor(userId, executorData) {
    const { executor_name, executor_email, executor_phone, relationship } = executorData
    
    // Validate
    if (!executor_name || !executor_email) throw "Missing required fields"
    
    // Check if already assigned
    const existing = await pool.query(
        "SELECT * FROM executors WHERE user_id = $1 AND executor_email = $2",
        [userId, executor_email]
    )
    if (existing.rows.length > 0) throw "Executor already assigned"
    
    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex')
    const salt = await bcrypt.genSalt(10)
    const tokenHash = await bcrypt.hash(token, salt)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    
    // Insert executor
    const result = await pool.query(
        `INSERT INTO executors (user_id, executor_name, executor_email, 
         executor_phone, relationship, verification_token_hash, 
         verification_token_expires_at, verification_status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW(), NOW())
         RETURNING executor_id, ...`,
        [userId, executor_name, executor_email, executor_phone, 
         relationship, tokenHash, expiresAt]
    )
    
    const executor = result.rows[0]
    
    // Send verification email (async - non-blocking)
    sendVerificationEmail(executor_email, token).catch(err => {
        console.error('Email send failed:', err)
        // Don't throw - email can be resent
    })
    
    // Log activity
    await logActivity(userId, 'executor_added', 
        `Executor added: ${executor_name}`, 'executor', executor.executor_id)
    
    return executor
}
```

#### Executor Verification Flow

```
EXECUTOR CLICKS EMAIL LINK with token
  ↓
[EXTRACT TOKEN FROM URL]
  └─ GET /api/executors/verify?token=<plaintext_token>&email=<email>
  ↓
[LOOKUP EXECUTOR]
  ├─ SELECT * FROM executors WHERE executor_email = $1
  └─ If not found → 404
  ↓
[VERIFY TOKEN]
  ├─ bcrypt.compare(plaintext_token, tokenHash)
  ├─ Check expiration: now < verification_token_expires_at
  └─ If failed → 400 (Invalid or expired token)
  ↓
[CREATE EXECUTOR ACCOUNT]
  ├─ Hash password: bcrypt.hash(password, salt)
  ├─ UPDATE executors SET 
  │  ├─ executor_password_hash = hash
  │  ├─ verification_status = 'verified'
  │  ├─ verification_token_hash = NULL (consumed)
  │  ├─ verification_token_expires_at = NULL
  │  └─ updated_at = NOW()
  ↓
[ACTIVITY LOGGING]
  └─ Log 'executor_verified' action
  ↓
[RESPONSE]
  └─ Confirmation page with login instructions
```

#### Grant Access Flow

```
OWNER CLICKS "Grant Access" button for executor
  ↓
[VERIFY OWNERSHIP & EXECUTOR STATUS]
  ├─ Ensure authenticated user is the owner (user_id match)
  ├─ Check executor exists and belongs to this user
  └─ Check executor is verified
  ↓
[UPDATE ACCESS STATUS]
  ├─ UPDATE executors SET access_granted = TRUE
  ├─ updated_at = NOW()
  └─ RETURNING executor details
  ↓
[ACTIVITY LOGGING]
  ├─ Log 'executor_access_granted' action
  └─ Include executor_id in log
  ↓
[RESPONSE]
  └─ Return updated executor with access_granted = true
```

#### Revoke Access Flow

```
OWNER CLICKS "Revoke Access" button for executor
  ↓
[VERIFY OWNERSHIP]
  ├─ Ensure authenticated user is the owner
  └─ Check executor exists and belongs to user
  ↓
[UPDATE ACCESS STATUS]
  ├─ UPDATE executors SET access_granted = FALSE
  ├─ updated_at = NOW()
  └─ RETURNING executor details
  ↓
[ACTIVITY LOGGING]
  └─ Log 'executor_access_revoked' action
  ↓
[RESPONSE]
  └─ Return updated executor with access_granted = false
```

---

### 4.4 Digital Will Generation Algorithm

#### Will Generation Flow

```
USER CLICKS "Generate Digital Will"
  ↓
[VERIFY AUTHENTICATION]
  └─ Check req.userId is set by JWT middleware
  ↓
[PARALLEL DATA COLLECTION]
  ├─ Query 1: SELECT * FROM users WHERE user_id = $1
  ├─ Query 2: SELECT * FROM digital_assets WHERE user_id = $1 
  │           ORDER BY created_at DESC
  ├─ Query 3: SELECT * FROM executors WHERE user_id = $1 
  │           ORDER BY created_at DESC
  └─ All 3 queries execute simultaneously (Promise.all)
  ↓
[BUILD ACTIONS SUMMARY]
  ├─ For each asset: "Review asset: {platform_name} ({category})"
  ├─ For each executor: "Executor {name} status: {verification_status}, 
  │                      Access: {granted/not_granted}"
  ├─ Asset statistics: "Total {n} assets in {m} categories"
  └─ Will timestamp
  ↓
[CREATE WILL DIRECTORY]
  ├─ Check if generated-wills/ folder exists
  ├─ Create with recursion if needed
  └─ Ensure write permissions
  ↓
[GENERATE PDF]
  ├─ Use pdfkit library
  ├─ Format will document with:
  │  ├─ Title & header
  │  ├─ User personal info (name, email)
  │  ├─ Asset list with details
  │  ├─ Executor list with status
  │  ├─ Instructions
  │  ├─ Generated timestamp
  │  └─ Footer
  ├─ Write to: generated-wills/digital-will-user-{userId}-{timestamp}.pdf
  └─ Return file path
  ↓
[STORE WILL RECORD]
  ├─ CREATE TABLE IF NOT EXISTS digital_will (...)
  ├─ INSERT INTO digital_will (user_id, file_path, created_at, updated_at)
  ├─ IF EXISTS: UPDATE instead of INSERT
  │  └─ Keep only latest will record per user
  └─ RETURNING will_id, created_at
  ↓
[ACTIVITY LOGGING]
  └─ Log 'will_generated' action
  ↓
[DASHBOARD UPDATE]
  ├─ loadDashboardData() called on frontend
  ├─ Fetches updated willCount
  ├─ Updates dashboard display
  └─ Marks checklist as "Complete"
  ↓
[RESPONSE]
  ├─ Return { willId, filePath, createdAt }
  └─ Frontend updates checklist and will display
```

**Pseudocode:**
```javascript
async function generateWill(userId) {
    // Fetch all needed data in parallel
    const [userResult, assetsResult, executorsResult] = await Promise.all([
        pool.query("SELECT * FROM users WHERE user_id = $1", [userId]),
        pool.query("SELECT * FROM digital_assets WHERE user_id = $1 ORDER BY created_at DESC", [userId]),
        pool.query("SELECT * FROM executors WHERE user_id = $1 ORDER BY created_at DESC", [userId])
    ])
    
    if (userResult.rows.length === 0) throw "User not found"
    
    const user = userResult.rows[0]
    const assets = assetsResult.rows
    const executors = executorsResult.rows
    
    // Build actions text
    const actions = buildActions(user, assets, executors)
    
    // Ensure directory exists
    const willDir = path.join(process.cwd(), 'generated-wills')
    if (!fs.existsSync(willDir)) fs.mkdirSync(willDir, { recursive: true })
    
    // Generate PDF
    const fileName = `digital-will-user-${userId}-${Date.now()}.pdf`
    const filePath = path.join(willDir, fileName)
    await generateWillPdf({
        outputPath: filePath,
        user,
        assets,
        executors,
        actions
    })
    
    // Store will record
    const result = await pool.query(
        `INSERT INTO digital_will (user_id, file_path, created_at, updated_at)
         VALUES ($1, $2, NOW(), NOW())
         ON CONFLICT (user_id) DO UPDATE SET file_path = $2, updated_at = NOW()
         RETURNING will_id, file_path, created_at`,
        [userId, filePath]
    )
    
    // Log activity
    await logActivity(userId, 'will_generated', 'Digital will generated', 'will', result.rows[0].will_id)
    
    return result.rows[0]
}
```

---

### 4.5 Dead Man's Switch Algorithm

#### Initialization Flow

```
USER FIRST ACCESSES DASHBOARD
  ↓
[CHECK DMS EXISTS]
  └─ SELECT * FROM dead_mans_switch WHERE user_id = $1
  ↓
[IF NOT EXISTS: CREATE RECORD]
  ├─ INSERT INTO dead_mans_switch (user_id, check_interval_days, 
  │   last_checkin, status, created_at, updated_at)
  ├─ check_interval_days = 30 (default)
  ├─ last_checkin = CURRENT_TIMESTAMP
  ├─ status = 'active'
  └─ created_at = NOW()
  ↓
[SCHEDULER STARTED]
  ├─ Node-cron job runs every 6 hours
  ├─ Checks all active DMS records
  └─ Processes expired check-ins
```

#### Check-In Flow (Manual)

```
USER CLICKS "I'm Still Here" / Check-In Button
  ↓
[VERIFY AUTHENTICATION]
  └─ Ensure req.userId is set
  ↓
[UPDATE CHECKIN TIMESTAMP]
  ├─ UPDATE dead_mans_switch SET 
  │  ├─ last_checkin = CURRENT_TIMESTAMP
  │  ├─ status = 'active'
  │  └─ updated_at = CURRENT_TIMESTAMP
  ├─ WHERE user_id = $1
  └─ RETURNING dms_id, check_interval_days, last_checkin, status
  ↓
[UPDATE USER ACTIVITY]
  ├─ UPDATE users SET last_active = CURRENT_TIMESTAMP 
  │  WHERE user_id = $1
  └─ Tracks last time user was active
  ↓
[ACTIVITY LOGGING]
  └─ Log 'dms_checkin' action
  ↓
[CALCULATE STATUS]
  ├─ daysSinceCheckin = now - last_checkin
  ├─ daysUntilTrigger = check_interval_days - daysSinceCheckin
  └─ Return countdown to trigger
  ↓
[RESPONSE]
  └─ Return { daysUntilTrigger, lastCheckin, status }
```

**Pseudocode:**
```javascript
async function checkIn(userId) {
    // Update check-in record
    const result = await pool.query(
        `UPDATE dead_mans_switch
         SET last_checkin = CURRENT_TIMESTAMP, status = 'active', updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1
         RETURNING dms_id, check_interval_days, last_checkin, status`,
        [userId]
    )
    
    if (result.rows.length === 0) throw "DMS not initialized"
    
    const dms = result.rows[0]
    
    // Update user last_active
    await pool.query(
        "UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE user_id = $1",
        [userId]
    )
    
    // Log activity
    await logActivity(userId, 'dms_checkin', 'User check-in performed', 'dead_mans_switch', dms.dms_id)
    
    // Calculate days remaining
    const lastCheckin = new Date(dms.last_checkin)
    const now = new Date()
    const daysSinceCheckin = Math.floor((now - lastCheckin) / (1000 * 60 * 60 * 24))
    const daysUntilTrigger = Math.max(0, dms.check_interval_days - daysSinceCheckin)
    
    return { dmsId: dms.dms_id, daysUntilTrigger, lastCheckin: dms.last_checkin, status: dms.status }
}
```

#### Automatic Trigger Flow (Scheduler)

```
CRON JOB RUNS (every 6 hours)
  ↓
[QUERY ALL ACTIVE DMS RECORDS]
  ├─ SELECT * FROM dead_mans_switch WHERE status = 'active'
  └─ Fetch all users with active DMS
  ↓
[FOR EACH DMS RECORD]
  │
  ├─ Calculate: daysSinceCheckin = now - last_checkin
  │
  ├─ IF daysSinceCheckin >= check_interval_days
  │  │
  │  ├─ [DMS TRIGGERED]
  │  │
  │  ├─ UPDATE dead_mans_switch SET status = 'triggered'
  │  │
  │  ├─ Get executors with access_granted = TRUE
  │  │
  │  ├─ Send notification emails:
  │  │  ├─ To executors: "Check-in period expired, assets ready for access"
  │  │  └─ To user (if email still valid): "Your DMS was triggered"
  │  │
  │  ├─ Query user's digital_assets
  │  │
  │  ├─ Generate automatic will (if not exists)
  │  │
  │  ├─ Log activity: 'dms_triggered'
  │  │
  │  └─ Update will status in digital_will table
  │
  └─ END FOR
  ↓
[COMPLETION]
  └─ Log completion time and number of triggers
```

**Pseudocode:**
```javascript
async function processDMSTriggersScheduled() {
    try {
        const result = await pool.query(
            "SELECT * FROM dead_mans_switch WHERE status = 'active'"
        )
        
        const triggeredCount = 0
        
        for (const dms of result.rows) {
            const lastCheckin = new Date(dms.last_checkin)
            const now = new Date()
            const daysSinceCheckin = Math.floor((now - lastCheckin) / (1000 * 60 * 60 * 24))
            
            // Check if interval exceeded
            if (daysSinceCheckin >= dms.check_interval_days) {
                
                // Trigger DMS
                await pool.query(
                    "UPDATE dead_mans_switch SET status = 'triggered', updated_at = NOW() WHERE dms_id = $1",
                    [dms.dms_id]
                )
                
                // Get executors with access
                const executors = await pool.query(
                    "SELECT * FROM executors WHERE user_id = $1 AND access_granted = TRUE AND verification_status = 'verified'",
                    [dms.user_id]
                )
                
                // Send emails (async)
                for (const executor of executors.rows) {
                    sendExecutorNotificationEmail(
                        executor.executor_email,
                        executor.executor_name,
                        dms.user_id
                    ).catch(err => console.error('Email failed:', err))
                }
                
                // Log activity
                await logActivity(
                    dms.user_id,
                    'dms_triggered',
                    'Dead man switch triggered - notification sent to executors',
                    'dead_mans_switch',
                    dms.dms_id
                )
                
                triggeredCount++
            }
        }
        
        console.log(`[DMS Scheduler] Processed ${result.rows.length} records, ${triggeredCount} triggered`)
    } catch (error) {
        console.error('[DMS Scheduler] Error:', error)
    }
}
```

---

### 4.6 Executor Portal Access Algorithm

#### Executor Login Flow

```
EXECUTOR ENTERS LOGIN FORM
  ↓
[INPUT VALIDATION]
  ├─ Email format check
  ├─ Password present
  └─ Both fields required
  ↓
[LOOKUP EXECUTOR]
  ├─ SELECT * FROM executors WHERE executor_email = $1
  └─ If not found → 401
  ↓
[VERIFY EXECUTOR STATUS]
  ├─ Check verification_status = 'verified'
  ├─ Check access_granted = TRUE
  └─ If either false → 403 (Access denied)
  ↓
[VERIFY PASSWORD]
  ├─ bcrypt.compare(inputPassword, executor_password_hash)
  └─ If mismatch → 401
  ↓
[GET OWNER INFO]
  ├─ SELECT * FROM users WHERE user_id = executor.user_id
  └─ Store owner_id for asset access
  ↓
[GENERATE TOKEN]
  ├─ jwt.sign({ executorId, userId, ownerUserId }, JWT_SECRET)
  ├─ expiresIn: '7d'
  └─ Include both executor and owner identifiers
  ↓
[FRONTEND STORAGE]
  ├─ localStorage.setItem('executorToken', token)
  └─ Redirect to executor portal
```

#### Get Owner's Assets (Executor View)

```
EXECUTOR CLICKS "View Assets"
  ↓
[VERIFY EXECUTOR AUTHENTICATION]
  ├─ Check JWT token contains executorId
  ├─ Verify executor.access_granted = TRUE
  └─ Check executor.verification_status = 'verified'
  ↓
[GET OWNER REFERENCE]
  ├─ Token contains ownerUserId
  └─ All queries use this userId
  ↓
[FETCH ASSETS]
  ├─ SELECT * FROM digital_assets WHERE user_id = ownerUserId
  ├─ Query executor's own info for display
  └─ Return formatted asset list
  ↓
[DISPLAY ASSETS]
  ├─ Show platform_name, category, account_identifier
  ├─ Show action_type and last_message
  ├─ Show created_at timestamp
  └─ Passwords NOT sent to frontend (security)
  ↓
[ACTIVITY LOGGING]
  └─ Log 'executor_viewed_assets' action
```

**Pseudocode:**
```javascript
async function getExecutorAssets(executorId, ownerUserId) {
    // Verify executor has access
    const executorResult = await pool.query(
        "SELECT * FROM executors WHERE executor_id = $1 AND user_id = $2 AND access_granted = TRUE",
        [executorId, ownerUserId]
    )
    
    if (executorResult.rows.length === 0) throw "Access denied"
    
    // Get owner info for display
    const ownerResult = await pool.query(
        "SELECT user_id, full_name, email FROM users WHERE user_id = $1",
        [ownerUserId]
    )
    
    // Get assets
    const assetsResult = await pool.query(
        `SELECT asset_id, platform_name, category, account_identifier, 
                action_type, last_message, created_at
         FROM digital_assets
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [ownerUserId]
    )
    
    // Log activity
    await logActivity(
        ownerUserId,
        'executor_viewed_assets',
        `Executor ${executorResult.rows[0].executor_name} accessed assets`,
        'asset',
        null
    )
    
    return {
        owner: ownerResult.rows[0],
        assets: assetsResult.rows
    }
}
```

---

## 5. Data Flow Diagrams

### 5.1 Complete User Journey (Birth to Death)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     COMPLETE DIGIPASS USER JOURNEY                          │
└─────────────────────────────────────────────────────────────────────────────┘

        REGISTRATION & SETUP PHASE
        ═══════════════════════════════
        
[1. User Registration]
    Register with name, email, password
         ↓
    ✓ Password hashed (bcrypt, 10 rounds)
    ✓ Stored in users table
    ✓ JWT token generated
         ↓
[2. Executor Assignment]
    Add executor names/emails
         ↓
    ✓ Executor records created
    ✓ Verification emails sent
    ✓ Executors verify identity
    ✓ Executors set own passwords
         ↓
[3. Asset Documentation]
    Add digital asset credentials
    - Email accounts
    - Bank accounts
    - Social media
    - Crypto wallets
    - Other platforms
         ↓
    ✓ Assets stored in database
    ✓ Activity logged
    ✓ Activity logged

        ACTIVE PHASE
        ═════════════════
        
[4. Ongoing Check-Ins]
    User logs in regularly
         ↓
    ✓ Dashboard shows estate status
    ✓ Manual "I'm here" button
    ✓ Automatic last_active timestamp
    ✓ DMS countdown visible
         ↓
[5. Estate Updates]
    Add/modify/delete assets
    Add/remove executors
    Generate wills
         ↓
    ✓ All changes logged to activity
    ✓ Will auto-generates with latest data
    ✓ Access can be granted/revoked

        INACTIVE PHASE (Trigger Point)
        ═══════════════════════════════════════════════
        
[6. Inactivity Detection]
    User hasn't logged in for 30+ days
         ↓
    Cron job detects at next 6-hour check
         ↓
[7. DMS Triggering]
    DMS status changed from 'active' → 'triggered'
         ↓
    ✓ Notifications sent to executors
    ✓ Assets become accessible
    ✓ Final will generated/finalized
    ✓ Activity logged
         ↓
[8. Executor Notification]
    Executors receive email:
    - Estate ready for access
    - Login link to portal
    - Asset summary
    - Instructions
         ↓
    ✓ Email sent async (non-blocking)
    ✓ Can be resent
    ✓ Contains executor's personal message (if set)

        EXECUTOR ACCESS PHASE
        ════════════════════════════════════════════════════════════
        
[9. Executor Portal Login]
    Executor verifies identity
         ↓
    ✓ Password verified (bcrypt)
    ✓ Access status checked
    ✓ JWT token generated with ownerUserId
    ✓ Redirects to executor portal
         ↓
[10. Asset Viewing]
    Executor sees all estate assets:
    - Platform names
    - Account identifiers
    - Action instructions
    - Passwords (decrypted on-demand)
    - Final messages
         ↓
    ✓ Can copy credentials
    ✓ Can follow instructions
    ✓ Can access linked accounts
         ↓
[11. Action Execution]
    Executor performs asset actions:
    
    IF action = 'pass':
        ├─ Transfer account access to beneficiary
        ├─ Update recovery email
        ├─ Set new password for beneficiary
        └─ Document transfer
    
    IF action = 'delete':
        ├─ Delete account permanently
        ├─ Log deletion timestamp
        └─ Archive data if needed
    
    IF action = 'last_message':
        ├─ Post final message to account
        ├─ Send to followers
        └─ Documented remembrance
         ↓
    ✓ Actions tracked in activity log
    ✓ Timestamps recorded
    ✓ Executor documentation stored

        FINAL STATE
        ══════════════════════════════════════════════════════════════
        
[12. Estate Closure]
    All assets processed
         ↓
    ✓ DMS status = 'completed'
    ✓ All assets actionable
    ✓ Final will archived
    ✓ Complete audit log available
    ✓ Legacy documented
```

### 5.2 Authentication Data Flow

```
Frontend (register.html)
    │
    ├─[User enters: name, email, password]
    │   ↓
    ├─[JavaScript validates]
    │   ├─Email format
    │   ├─Password length
    │   └─All fields present
    │   ↓
    └─[POST /api/auth/register]
        │
        ├─ Content-Type: application/json
        ├─ Body: { full_name, email, password }
        └─ [Express Server]
            │
            ├─[Controller: register()]
            │   ├─Validate input
            │   ├─Check email uniqueness
            │   │  └─SELECT WHERE email = $1
            │   ├─Hash password
            │   │  └─bcrypt.hash(plaintext, salt(10))
            │   ├─Insert user
            │   │  └─INSERT INTO users (...)
            │   │     RETURNING user_id
            │   ├─Generate JWT token
            │   │  └─jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
            │   └─Return response
            │       │
            │       └─{ userId, fullName, email, token }
            │
            └─[Response 201 Created]
                │
                └─[Frontend: localStorage.setItem('token', token)]
                    └─Redirect to /dashboard.html

[On Dashboard Request with Token]
    │
    ├─HTTP GET /dashboard.html
    │   ├─Authorization: Bearer <token_from_localStorage>
    │   └─[Server checks token]
    │       │
    │       ├─[Middleware: authenticateToken()]
    │       │   ├─Extract token from header
    │       │   ├─jwt.verify(token, JWT_SECRET)
    │       │   │  ├─Check signature
    │       │   │  ├─Check expiration
    │       │   │  └─Decode { userId, iat, exp }
    │       │   ├─Set req.userId = userId
    │       │   └─Allow request
    │       │
    │       └─[Controllers can now access req.userId]
    │           └─User-specific data fetched
    │
    └─[Dashboard loads with user data]
```

---

## 6. Module Workflows

### 6.1 Asset Management Module Workflow

```
┌─────────────────────────────────────────────────────┐
│           ASSET MANAGEMENT WORKFLOW                 │
└─────────────────────────────────────────────────────┘

FRONTEND: frontend/dashboard.html
  ├─ Lines: 1440-1451 (Asset action button inputs)
  ├─ Lines: ~1800+ (JavaScript initialization)
  └─ Forms for adding/editing/deleting assets

BACKEND: controllers/assetsController.js
  ├─ addAsset() → POST /api/assets
  ├─ getAssets() → GET /api/assets
  ├─ updateAsset() → PUT /api/assets/:id
  └─ deleteAsset() → DELETE /api/assets/:id

FRONTEND JS: frontend/js/dashboard.js
  ├─ handleAddAsset() → Form submission handler
  ├─ renderAssets() → Display assets in cards
  ├─ handleDeleteAsset() → Deletion handler
  └─ loadAssets() → Fetch from server

DATABASE: digital_assets table
  ├─ asset_id (PK)
  ├─ user_id (FK)
  ├─ platform_name
  ├─ category
  ├─ account_identifier
  ├─ account_password
  ├─ action_type ('pass'|'delete'|'last_message')
  ├─ last_message (optional)
  └─ Timestamps

WORKFLOW STEPS:

1. User fills asset form on dashboard
   ├─ Selects platform (Gmail, Netflix, etc.)
   ├─ Selects category (email, finance, etc.)
   ├─ Enters account identifier (username/email)
   ├─ Enters password
   └─ Selects action (pass/delete/message)

2. Frontend validation
   ├─ All required fields present
   ├─ Action type valid
   └─ If 'last_message' → message required

3. Submit to backend
   ├─ POST /api/assets
   ├─ Headers: Authorization: Bearer <token>
   └─ Body: { platform_name, category, account_identifier, account_password, action_type, last_message }

4. Backend processing
   ├─ authenticateToken middleware sets req.userId
   ├─ assetsController.addAsset() called
   ├─ Input validation repeated
   ├─ Parameterized query INSERT
   ├─ Activity logged
   └─ Response: { asset_id, platform_name, ... }

5. Frontend display
   ├─ Asset added to renderAssets() list
   ├─ Card displays: Platform + Category + Account + Action
   ├─ Action buttons shown (Delete/Edit)
   └─ Real-time UI update

6. User can delete asset
   ├─ Clicks Delete button
   ├─ Confirmation dialog shown
   ├─ DELETE /api/assets/:id sent
   ├─ Backend verifies ownership (user_id match)
   ├─ Parameterized query DELETE
   ├─ Activity logged
   └─ Frontend removes from list

7. Assets included in will
   ├─ When user generates will
   ├─ All assets fetched from database
   ├─ Listed in PDF with action instructions
   └─ Executor can see them
```

### 6.2 Will Generation Module Workflow

```
┌──────────────────────────────────────────────┐
│      WILL GENERATION WORKFLOW                │
└──────────────────────────────────────────────┘

TRIGGERED BY: User clicks "Generate Will" on dashboard

FRONTEND: frontend/dashboard.html & frontend/js/dashboard.js
  ├─ handleGenerateWill() function
  ├─ POST /api/will/generate-will
  └─ Updates UI with checklist mark

BACKEND: controllers/willController.js
  ├─ generateWill() main function
  ├─ buildActions() → summarize assets/executors
  └─ Calls utils/willPdf.js for PDF generation

DATABASE QUERIES (parallel):
  1. SELECT * FROM users WHERE user_id = $1
  2. SELECT * FROM digital_assets WHERE user_id = $1 ORDER BY created_at DESC
  3. SELECT * FROM executors WHERE user_id = $1 ORDER BY created_at DESC

PDF GENERATION:
  ├─ Create directory: generated-wills/
  ├─ Filename: digital-will-user-{userId}-{timestamp}.pdf
  ├─ Content sections:
  │  ├─ Header with DIGIPASS branding
  │  ├─ Personal info (name, email, DOB if available)
  │  ├─ Generation date and time
  │  ├─ ASSETS SECTION
  │  │  ├─ Table with all assets
  │  │  ├─ Columns: Platform | Category | Account | Action Type | Message
  │  │  └─ Total asset count by category
  │  ├─ EXECUTORS SECTION
  │  │  ├─ List of executors
  │  │  ├─ Their verification status
  │  │  ├─ Access granted status
  │  │  └─ Contact info
  │  ├─ INSTRUCTIONS SECTION
  │  │  ├─ General instructions
  │  │  ├─ How to access assets
  │  │  ├─ Where to find passwords
  │  │  └─ Important notes
  │  ├─ LEGAL DISCLAIMER
  │  └─ Footer with page numbers
  └─ Write to file system

DATABASE STORAGE:
  ├─ Create digital_will table if not exists
  ├─ INSERT or UPDATE (if exists)
  ├─ Store: user_id, file_path, created_at
  └─ Return will_id

ACTIVITY LOGGING:
  └─ INSERT INTO user_activity ('will_generated', ...)

FRONTEND UPDATE:
  ├─ loadDashboardData() called
  ├─ Fetches updated will info
  ├─ Updates dashboard willCount (was 0, now 1)
  ├─ Marks checklist item as COMPLETE
  ├─ Displays "Download Will" button
  └─ Shows generation timestamp

DOWNLOAD FLOW (later):
  ├─ User clicks "Download Will"
  ├─ GET /api/will/download-will/:willId
  ├─ Server streams file to browser
  ├─ Browser triggers download
  └─ File saved as digital-will.pdf
```

### 6.3 Dead Man's Switch Module Workflow

```
┌──────────────────────────────────────────────────────────┐
│        DEAD MAN'S SWITCH WORKFLOW                        │
└──────────────────────────────────────────────────────────┘

INITIALIZATION (First Dashboard Load):

1. Database check
   ├─ SELECT * FROM dead_mans_switch WHERE user_id = $1
   └─ If not exists → INSERT with defaults
       ├─ check_interval_days = 30
       ├─ last_checkin = NOW()
       └─ status = 'active'

2. Frontend display
   ├─ Show DMS status widget
   ├─ Show days since check-in
   ├─ Show days until trigger
   ├─ Show "I'm Still Here" button
   └─ Show status badge (Active/Triggered/Completed)

MANUAL CHECK-IN (User clicks "I'm Still Here"):

1. Frontend handler
   ├─ POST /api/dead-mans-switch/check-in
   ├─ Headers: Authorization: Bearer <token>
   └─ No body needed

2. Backend processing
   ├─ authenticateToken middleware
   ├─ UPDATE dead_mans_switch
   │  ├─ last_checkin = NOW()
   │  ├─ status = 'active'
   │  └─ updated_at = NOW()
   ├─ UPDATE users
   │  ├─ last_active = NOW()
   │  └─ is_active = TRUE
   ├─ INSERT INTO user_activity ('dms_checkin', ...)
   └─ RETURNING dms record

3. Calculate remaining days
   ├─ daysSinceCheckin = now - last_checkin
   ├─ daysUntilTrigger = check_interval_days - daysSinceCheckin
   └─ Return in response

4. Frontend update
   ├─ Update DMS widget display
   ├─ Show new countdown
   ├─ Reset status to 'Active'
   └─ Show last check-in timestamp

AUTOMATIC TRIGGER (Scheduler):

1. Cron job setup
   ├─ node-cron with schedule: '0 */6 * * *'
   ├─ Runs every 6 hours
   ├─ Starts when server starts
   └─ Continues throughout server lifetime

2. Every 6 hours
   ├─ Query: SELECT * FROM dead_mans_switch WHERE status = 'active'
   ├─ For each DMS record
   │  ├─ Calculate daysSinceCheckin
   │  ├─ IF daysSinceCheckin >= check_interval_days
   │  │  ├─ UPDATE dead_mans_switch SET status = 'triggered'
   │  │  ├─ Query executors with access_granted = TRUE
   │  │  ├─ For each executor:
   │  │  │  ├─ Compose email with:
   │  │  │  │  ├─ Owner name
   │  │  │  │  ├─ Asset count
   │  │  │  │  ├─ Portal login link
   │  │  │  │  ├─ Asset summary
   │  │  │  │  └─ Instructions
   │  │  │  └─ sendExecutorNotificationEmail() (async)
   │  │  ├─ To owner email:
   │  │  │  ├─ Subject: "Your Dead Man's Switch was triggered"
   │  │  │  ├─ Content: DMS was activated, executors notified
   │  │  │  └─ Recovery instructions if false alarm
   │  │  ├─ INSERT INTO user_activity ('dms_triggered', ...)
   │  │  └─ Log completion
   │  └─ END IF
   └─ END FOR

3. Email delivery (async, non-blocking)
   ├─ Emails queued in background
   ├─ SMTP connection established
   ├─ Emails sent to recipients
   └─ Delivery status logged

EXECUTOR NOTIFICATION EMAIL:

Subject: "Estate Ready - [Owner Name]"

Content:
────────────────────────────────
Dear [Executor Name],

The Dead Man's Switch for [Owner Name]'s digital estate has been triggered.
This means the owner has been inactive for 30 days or more.

Your designated access to the digital estate has been automatically granted.

ESTATE SUMMARY:
- Total Assets: 12
- Categories: Email, Finance, Social Media, Storage
- Owner Name: [Full Name]
- Estate ID: [user_id]

ACCESS YOUR ASSETS:
Visit: https://digipass-pi.vercel.app/executor-portal
Email: [Your executor email]
Password: [Your chosen password]

ASSETS YOU HAVE ACCESS TO:
1. Gmail Account (Email)
2. Bank Account - Chase (Finance)
3. Twitter Account (Social Media)
... and 9 more

INSTRUCTIONS:
1. Log in to executor portal
2. Review all digital assets
3. Follow action instructions for each asset
4. Contact support if you need assistance

If this was triggered by mistake, contact us immediately.

Best regards,
DIGIPASS Team
────────────────────────────────

EXECUTOR PORTAL LOGIN:

1. Executor receives email with credentials
2. Visits executor portal
3. Enters email + password
4. Backend verification:
   ├─ Lookup executor by email
   ├─ Verify verification_status = 'verified'
   ├─ Verify access_granted = TRUE
   ├─ bcrypt.compare(password, hash)
   ├─ If all valid: Generate JWT with ownerUserId
   └─ If any invalid: 401/403 error

5. Executor portal displays
   ├─ Owner name and email
   ├─ All digital assets in table
   ├─ Asset details (platform, account, action)
   ├─ Passwords available for copying
   ├─ Action instructions
   └─ Final messages (if any)

6. Executor executes actions
   ├─ For each asset with action_type = 'pass'
   │  └─ Transfer account credentials to beneficiary
   ├─ For each asset with action_type = 'delete'
   │  └─ Delete account permanently
   └─ For each asset with action_type = 'last_message'
      └─ Post final message to account

POST-TRIGGER STATUS:

1. User logged back in (false alarm)?
   ├─ Manual check-in resets DMS
   ├─ Status returns to 'active'
   ├─ Countdown restarts
   └─ Can contact executors to let them know

2. DMS completed?
   ├─ All actions executed
   ├─ Status changed to 'completed'
   ├─ No further automated actions
   └─ Executors still have access
```

### 6.4 Executor Portal Module Workflow

```
┌────────────────────────────────────────────────────────┐
│        EXECUTOR PORTAL WORKFLOW                        │
└────────────────────────────────────────────────────────┘

EXECUTOR ASSIGNMENT (Owner Side):

1. Owner clicks "Add Executor" on dashboard
2. Fills form:
   ├─ Executor name
   ├─ Email address
   ├─ Phone (optional)
   └─ Relationship (spouse, child, attorney, etc.)

3. Backend processing
   ├─ Validation (email format, uniqueness for this user)
   ├─ Generate verification token (32 random bytes)
   ├─ Hash token with bcrypt (salt 10)
   ├─ Store hash + 24-hour expiration in database
   ├─ Create executor record with verification_status = 'pending'
   ├─ Send verification email (async, non-blocking)
   └─ Response sent immediately (doesn't wait for email)

4. Verification email sent
   ├─ To: executor email
   ├─ Contains: verification link with token + email
   ├─ Link: /api/executors/verify?token=<plaintext>&email=<email>
   └─ Expires in 24 hours

EXECUTOR VERIFICATION (Executor Side):

1. Executor receives email
   ├─ Clicks verification link
   └─ Navigates to executor-login.html

2. Verification form
   ├─ Email pre-filled
   ├─ Requests password setup
   └─ Token in URL

3. Executor submits verification
   ├─ GET /api/executors/verify?token=<token>&email=<email>
   │  ├─ Find executor by email
   │  ├─ bcrypt.compare(token, tokenHash)
   │  ├─ Check expiration: now < expires_at
   │  ├─ If valid: show password form
   │  └─ If invalid: show error (token expired/invalid)

4. Executor sets password
   ├─ POST /api/executors/verify-password
   ├─ Hash new password with bcrypt
   ├─ UPDATE executors:
   │  ├─ executor_password_hash = hash
   │  ├─ verification_status = 'verified'
   │  ├─ verification_token_hash = NULL (consumed)
   │  ├─ verification_token_expires_at = NULL
   │  └─ updated_at = NOW()
   └─ Response: "Verification complete"

EXECUTOR LOGIN:

1. Executor visits executor-login.html
   ├─ Form for: email + password
   └─ No owner identification needed

2. Executor submits credentials
   ├─ POST /api/executors/login
   ├─ Body: { email, password }
   └─ Header: No auth needed (public endpoint)

3. Backend verification
   ├─ Query: SELECT * FROM executors WHERE executor_email = $1
   ├─ Check verification_status = 'verified'
   ├─ Check access_granted = TRUE
   ├─ bcrypt.compare(inputPassword, executor_password_hash)
   ├─ If all valid:
   │  ├─ Query owner: SELECT * FROM users WHERE user_id = ?
   │  ├─ Generate JWT with ownerUserId (important!)
   │  ├─ jwt.sign({ executorId, userId, ownerUserId }, JWT_SECRET)
   │  └─ Return { token, executorName, ownerName, ... }
   └─ If any invalid: 401/403

4. Frontend storage
   ├─ localStorage.setItem('executorToken', token)
   ├─ localStorage.setItem('ownerUserId', ownerUserId)
   └─ Redirect to executor-dashboard.html

EXECUTOR PORTAL DASHBOARD:

1. View owner info
   ├─ Owner name
   ├─ Owner email
   └─ Date access granted

2. View digital assets
   ├─ GET /api/executor-portal/assets
   ├─ Backend uses ownerUserId from token
   ├─ Query: SELECT * FROM digital_assets WHERE user_id = ownerUserId
   ├─ Return asset list WITHOUT raw passwords
   └─ Frontend displays in table

3. Asset table columns
   ├─ Platform (Gmail, Netflix, etc.)
   ├─ Category (email, finance, social, etc.)
   ├─ Account Identifier (username/email)
   ├─ Action Type (Pass/Delete/Message)
   ├─ Last Message (if action = 'last_message')
   └─ Actions (View Details, Copy Account, etc.)

4. View asset details
   ├─ Click on asset row
   ├─ GET /api/executor-portal/assets/:assetId
   ├─ Backend verifies:
   │  ├─ Asset belongs to ownerUserId
   │  └─ Executor has access
   ├─ Return full asset details INCLUDING password
   └─ Display in modal/detail view

5. Execute asset actions
   ├─ Copy account identifier
   ├─ Get password (may require confirmation)
   ├─ View action instructions
   ├─ View final message
   └─ Click "Mark as Completed" (optional tracking)

EXECUTOR ASSETS ENDPOINT:

GET /api/executor-portal/assets

Authentication: JWT with executorId + ownerUserId

Response: {
  owner: {
    user_id,
    full_name,
    email,
    created_at
  },
  assets: [
    {
      asset_id,
      platform_name,
      category,
      account_identifier,
      account_password,
      action_type,
      last_message,
      created_at
    },
    ...
  ]
}

Access Control:
├─ Only executor with access_granted = TRUE can view
├─ Only sees assets for ownerUserId
├─ Must be verified
├─ Token must contain valid JWT signature
└─ All queries filtered by ownerUserId

PASSWORD SECURITY:
├─ Passwords stored in plain text in database
├─ Only sent to executor portal (HTTPS only)
├─ Not sent to owner's dashboard
├─ Only accessible when executor has been granted access
├─ Executor can copy to clipboard
└─ Not logged in activity for security
```

---

## 7. Database Schema

### 7.1 Complete Database Structure

```sql
-- USERS TABLE
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  last_active TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- DIGITAL ASSETS TABLE
CREATE TABLE digital_assets (
  asset_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  platform_name VARCHAR(255),
  category VARCHAR(100),
  account_identifier VARCHAR(255),
  account_password TEXT,
  action_type VARCHAR(20),
  last_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_digital_assets_user_id ON digital_assets(user_id);
CREATE INDEX idx_digital_assets_created_at ON digital_assets(created_at DESC);

-- EXECUTORS TABLE
CREATE TABLE executors (
  executor_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  executor_name VARCHAR(255) NOT NULL,
  executor_email VARCHAR(255) NOT NULL,
  executor_phone VARCHAR(20),
  relationship VARCHAR(100),
  verification_status VARCHAR(20) DEFAULT 'pending',
  access_granted BOOLEAN DEFAULT FALSE,
  executor_password_hash TEXT,
  verification_token_hash TEXT,
  verification_token_expires_at TIMESTAMP,
  verification_sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_executors_user_id ON executors(user_id);
CREATE INDEX idx_executors_created_at ON executors(created_at DESC);

-- DIGITAL WILL TABLE
CREATE TABLE digital_will (
  will_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_digital_will_user_id ON digital_will(user_id);

-- DEAD MAN'S SWITCH TABLE
CREATE TABLE dead_mans_switch (
  dms_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  check_interval_days INTEGER DEFAULT 30,
  last_checkin TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_dms_status ON dead_mans_switch(status);

-- USER ACTIVITY TABLE
CREATE TABLE user_activity (
  activity_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  description TEXT,
  entity_type VARCHAR(50),
  entity_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_user_activity_user_id ON user_activity(user_id, created_at DESC);
```

### 7.2 Data Relationships

```
users (1) ─────── (N) digital_assets
  │                (stores credentials for digital accounts)
  │
  ├─────── (N) executors
  │         (designated digital estate managers)
  │         └─ Each executor has:
  │            ├─ verification_status: pending/verified/rejected
  │            ├─ access_granted: FALSE until owner grants
  │            └─ executor_password_hash: Set after verification
  │
  ├─────── (1) digital_will
  │         (latest will for user)
  │         └─ Only one per user (most recent)
  │
  ├─────── (1) dead_mans_switch
  │         (check-in status)
  │         └─ Unique per user, auto-created
  │
  └─────── (N) user_activity
           (audit log)
           └─ All actions tracked here
```

---

## 8. API Endpoints

### 8.1 Complete API Reference

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | /api/auth/register | No | Create new user account |
| POST | /api/auth/login | No | Login with email/password, get JWT |
| GET | /api/auth/me | Yes | Get authenticated user's info |
| POST | /api/assets | Yes | Add new digital asset |
| GET | /api/assets | Yes | Get all user's assets |
| PUT | /api/assets/:id | Yes | Update asset details |
| DELETE | /api/assets/:id | Yes | Delete asset |
| POST | /api/executors | Yes | Add new executor |
| GET | /api/executors | Yes | Get all user's executors |
| POST | /api/executors/verify | No | Verify executor email (set password) |
| POST | /api/executors/:id/grant-access | Yes | Owner grants executor access |
| PATCH | /api/executors/:id/revoke-access | Yes | Owner revokes executor access |
| POST | /api/will/generate-will | Yes | Generate digital will PDF |
| GET | /api/will | Yes | Check if will exists |
| GET | /api/will/download-will/:willId | Yes | Download will PDF |
| GET | /api/dead-mans-switch/status | Yes | Get DMS countdown status |
| POST | /api/dead-mans-switch/check-in | Yes | Manual check-in (reset timer) |
| POST | /api/executor-portal/login | No | Executor login |
| GET | /api/executor-portal/assets | Yes (Executor) | Executor view owner's assets |
| GET | /api/activity | Yes | Get user's activity log |

### 8.2 Example API Flows

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response: 201 Created
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": 1,
    "fullName": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Add Asset
```
POST /api/assets
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "platform_name": "Gmail",
  "category": "email",
  "account_identifier": "john.doe@gmail.com",
  "account_password": "MyGmailPassword123",
  "action_type": "pass",
  "last_message": null
}

Response: 201 Created
{
  "success": true,
  "message": "Asset created successfully",
  "data": {
    "asset_id": 1,
    "platform_name": "Gmail",
    "category": "email",
    "account_identifier": "john.doe@gmail.com",
    "action_type": "pass",
    "last_message": null,
    "created_at": "2024-05-03T10:00:00Z"
  }
}
```

#### Add Executor
```
POST /api/executors
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "executor_name": "Jane Doe",
  "executor_email": "jane@example.com",
  "executor_phone": "+1-555-0100",
  "relationship": "spouse"
}

Response: 201 Created
{
  "success": true,
  "message": "Executor added successfully. Verification email sent.",
  "data": {
    "executor_id": 1,
    "executor_name": "Jane Doe",
    "executor_email": "jane@example.com",
    "relationship": "spouse",
    "verification_status": "pending",
    "access_granted": false
  }
}

// Verification email sent to jane@example.com with link containing token
```

#### Generate Will
```
POST /api/will/generate-will
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "success": true,
  "message": "Will generated successfully",
  "data": {
    "will_id": 1,
    "file_path": "generated-wills/digital-will-user-1-1704270000000.pdf",
    "created_at": "2024-05-03T10:00:00Z"
  }
}
```

#### Check DMS Status
```
GET /api/dead-mans-switch/status
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "dms_id": 1,
    "check_interval_days": 30,
    "last_checkin": "2024-04-03T10:00:00Z",
    "status": "active",
    "daysSinceCheckin": 30,
    "daysUntilTrigger": 0,
    "created_at": "2024-01-01T00:00:00Z"
  }
}

// daysUntilTrigger = 0 means TRIGGERED NOW
```

#### Executor Login
```
POST /api/executors/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "ExecutorPassword123"
}

Response: 200 OK
{
  "success": true,
  "message": "Login successful",
  "data": {
    "executorId": 1,
    "executorName": "Jane Doe",
    "ownerName": "John Doe",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

// Frontend stores token and ownerUserId for executor portal
```

---

## 9. Security Algorithms

### 9.1 Password Security

```
PASSWORD STORAGE ALGORITHM:

User Input: "MyPassword123"
    ↓
[VALIDATION]
  ├─ Minimum length: 6 characters
  ├─ No null/empty
  └─ No SQL special chars (handled by parameterized queries)
    ↓
[BCRYPT HASHING]
  ├─ salt = bcrypt.genSalt(10)
  │  └─ 10 salt rounds = 2^10 iterations
  │  └─ Each additional round = 2x time to crack
  │  └─ At 10: ~0.3 seconds per hash (secure)
  │
  ├─ hash = bcrypt.hash(plaintext, salt)
  │  └─ PBKDF2 algorithm underneath
  │  └─ Adaptive over time (more expensive as CPU improves)
  │  └─ Result: $2a$10$xyz...def (60 chars)
  │
  └─ hash stored in database
     └─ PLAINTEXT PASSWORD NEVER STORED
    ↓
[VERIFICATION (Login)]
  ├─ Input: "MyPassword123"
  ├─ From DB: $2a$10$xyz...def
  ├─ bcrypt.compare(input, hash)
  │  └─ Hash input with same salt
  │  └─ Constant-time comparison (prevents timing attacks)
  │  └─ Returns boolean: true/false
  └─ If false → 401 Unauthorized
```

### 9.2 SQL Injection Prevention

```
VULNERABLE (NEVER DO THIS):
    const query = `SELECT * FROM users WHERE email = '${email}'`
    // If email = "'; DROP TABLE users; --"
    // Result: SELECT * FROM users WHERE email = ''; DROP TABLE users; --'
    // Executes: DROP TABLE users

SAFE (ALWAYS DO THIS):
    const query = `SELECT * FROM users WHERE email = $1`
    const result = await pool.query(query, [email])
    // Values passed separately
    // Escaping handled by pg library
    // No SQL injection possible

PARAMETERIZED QUERY FLOW:
    1. Query template: "INSERT INTO users (email, password_hash) VALUES ($1, $2)"
    2. Values array: [user_email, password_hash]
    3. pg library sends separately to database
    4. Database engine treats values as data, never code
    5. Even if value = "'; DROP TABLE;", it's just data
```

### 9.3 JWT Token Security

```
TOKEN GENERATION:
    Header:   { "alg": "HS256", "typ": "JWT" }
    Payload:  { "userId": 1, "iat": 1704270000, "exp": 1704876000 }
    Secret:   process.env.JWT_SECRET (stored server-side only)
    
    Algorithm:
    1. Base64 encode header
    2. Base64 encode payload
    3. HMAC-SHA256(header.payload, secret) → signature
    4. Result: header.payload.signature
    
TOKEN VERIFICATION:
    1. Extract token from Authorization header
    2. Split by '.' → [header, payload, signature]
    3. Verify signature: HMAC-SHA256(header.payload, secret)
       └─ Must match provided signature
       └─ If attacker modifies payload, signature won't match
    4. Decode payload
    5. Check expiration: current_time < exp
    6. Extract userId from payload
    
TOKEN SECURITY:
    ├─ Secret never sent to client
    ├─ Can't forge without secret
    ├─ Tampering detected immediately
    ├─ 7-day expiration (reasonable security window)
    ├─ Stored in localStorage (vulnerable to XSS but acceptable trade-off)
    └─ Sent in Authorization header with every request
```

### 9.4 Access Control

```
OWNER ACCESS (Digital Assets):
    1. User logs in
    2. Frontend stores token with userId in payload
    3. When accessing assets:
       ├─ Token sent in Authorization header
       ├─ Backend extracts req.userId from token
       ├─ Query filters by user_id: "... WHERE user_id = $1" [req.userId]
       ├─ Results only show own assets
       └─ Trying to access other user's assets returns 404/403

EXECUTOR ACCESS (Digital Assets):
    1. Executor logs in
    2. Token contains: executorId + ownerUserId
    3. When accessing assets:
       ├─ Verify executor.access_granted = TRUE
       ├─ Verify executor.verification_status = 'verified'
       ├─ Query uses ownerUserId: "... WHERE user_id = $1" [ownerUserId]
       ├─ Parameterized queries prevent injection
       └─ Executor only sees owner's assets, no access to others

UNVERIFIED EXECUTOR:
    ├─ Cannot log in
    ├─ Cannot access assets
    ├─ Must complete email verification first
    └─ Verification token has 24-hour expiration
```

### 9.5 CORS Configuration

```
ALLOWED ORIGINS (from .env):
    CORS_ORIGIN=https://digipass-pi.vercel.app,
                https://digipass-3l63.onrender.com,
                https://digipassv2.netlify.app

CORS CHECK:
    1. Browser sends Origin header
    2. Server checks: Origin in ALLOWED_ORIGINS?
    3. If yes: Send Access-Control-Allow-Origin response header
    4. If no: Request blocked, CORS error in browser console

PREVENTS:
    ├─ Malicious websites from accessing API
    ├─ Credentials being leaked to unauthorized origins
    └─ Protects against cross-origin request forgery

CREDENTIAL COOKIES:
    credentials: true in fetch options
    └─ Tokens sent in Authorization header instead
    └─ More secure than cookies
```

---

## 10. Real-World Workflow Scenarios

### Scenario 1: New User Setup

**User:** Alice, age 45, wants to set up digital estate plan

**Timeline:**

```
Day 1: Registration
  ├─ Alice visits https://digipass-pi.vercel.app
  ├─ Clicks "Register"
  ├─ Fills form: Name, Email (alice@example.com), Password
  ├─ Frontend validates
  ├─ POST /api/auth/register sent
  ├─ Backend:
  │  ├─ Bcrypt hashes password (salt 10)
  │  ├─ INSERT INTO users (...) 
  │  ├─ Generates JWT with userId=5
  │  └─ Returns token
  ├─ Frontend saves token to localStorage
  └─ Redirected to dashboard.html

Day 1-2: Add Executors
  ├─ Alice sees checklist: "Add Executors (0/2)"
  ├─ Clicks "Add Executor" button
  ├─ Fills form 1:
  │  ├─ Name: "Bob Smith"
  │  ├─ Email: "bob@example.com"
  │  ├─ Phone: "+1-555-0100"
  │  └─ Relationship: "spouse"
  ├─ POST /api/executors sent with JWT
  ├─ Backend:
  │  ├─ Generates 32-byte random token
  │  ├─ Bcrypt hashes token
  │  ├─ INSERT INTO executors (verification_status='pending', ...)
  │  ├─ Sends verification email to bob@example.com (async)
  │  └─ Returns executor_id=1
  ├─ Same for Executor 2: "Carol Jones" (carol@example.com)
  └─ Checklist updates: "Add Executors (2/2) ✓"

Day 2-3: Executor Verification
  ├─ Bob receives verification email
  ├─ Clicks link: /api/executors/verify?token=<32-byte>&email=bob@example.com
  ├─ Frontend verifies token (GET request)
  ├─ If valid (bcrypt.compare succeeds):
  │  ├─ Shows password setup form
  │  ├─ Bob sets password: "BobPassword456"
  │  ├─ POST /api/executors/verify-password
  │  ├─ Backend:
  │  │  ├─ Bcrypt hashes new password
  │  │  ├─ UPDATE executors SET
  │  │  │  ├─ executor_password_hash=<hash>
  │  │  │  ├─ verification_status='verified'
  │  │  │  └─ verification_token_hash=NULL (consumed)
  │  │  └─ Returns success
  │  └─ Shows login page for executor portal
  │
  └─ Carol does the same (Day 3)

Day 4: Add Digital Assets
  ├─ Alice sees dashboard with assets section
  ├─ Clicks "Add Asset"
  ├─ Fills form for Gmail:
  │  ├─ Platform: "Gmail"
  │  ├─ Category: "email"
  │  ├─ Account: "alice@gmail.com"
  │  ├─ Password: "AliceGmailPwd789"
  │  ├─ Action: "pass" (transfer to executor)
  │  └─ Message: "None"
  ├─ POST /api/assets sent with JWT
  ├─ Backend:
  │  ├─ Validates input
  │  ├─ INSERT INTO digital_assets (user_id=5, ...)
  │  ├─ INSERT INTO user_activity ('asset_created', ...)
  │  └─ Returns asset_id=1
  ├─ Adds 5 more assets (Netflix, Bank, PayPal, Twitter, Dropbox)
  └─ Dashboard shows: "Assets (6)"

Day 5: Grant Access
  ├─ Alice reviews executors
  ├─ Sees Bob: "verification_status=verified, access=not granted"
  ├─ Clicks "Grant Access" for Bob
  ├─ PATCH /api/executors/1/grant-access sent
  ├─ Backend:
  │  ├─ Verifies ownership
  │  ├─ Verifies Bob is verified
  │  ├─ UPDATE executors SET access_granted=TRUE
  │  ├─ INSERT INTO user_activity ('executor_access_granted', ...)
  │  └─ Returns updated executor
  ├─ Repeats for Carol
  └─ Dashboard shows executors with "Access: Granted" status

Day 6: Generate Will
  ├─ Alice clicks "Generate Digital Will"
  ├─ POST /api/will/generate-will sent
  ├─ Backend parallel queries:
  │  ├─ SELECT users WHERE user_id=5
  │  ├─ SELECT digital_assets WHERE user_id=5 (gets 6 assets)
  │  └─ SELECT executors WHERE user_id=5 (gets Bob + Carol)
  ├─ Builds actions text
  ├─ Generates PDF with pdfkit:
  │  ├─ Header: "Digital Will - Alice"
  │  ├─ Personal info section
  │  ├─ Assets table (6 rows)
  │  ├─ Executors section (Bob + Carol)
  │  ├─ Instructions
  │  └─ Footer with timestamp
  ├─ Saves to: generated-wills/digital-will-user-5-1704270000000.pdf
  ├─ INSERT INTO digital_will (user_id=5, file_path=...)
  ├─ INSERT INTO user_activity ('will_generated', ...)
  ├─ Frontend loadDashboardData():
  │  ├─ Fetches GET /api/will
  │  ├─ Gets will_id=1, created_at=...
  │  └─ willCount changes from 0 → 1
  ├─ Checklist marks "Generate Digital Will" ✓
  └─ Shows "Download Will" button

Day 7: Setup Complete
  ├─ Alice's dashboard shows:
  │  ├─ Estate Health: "100% Complete"
  │  ├─ Checklist: All items ✓
  │  ├─ 6 Digital Assets
  │  ├─ 2 Executors (both verified and granted access)
  │  ├─ Digital Will (generated 1 day ago)
  │  └─ DMS Status: Active (30 days until trigger)
  └─ Alice can now relax knowing her digital estate is planned

Days 7-37: Daily Usage
  ├─ Alice logs in occasionally
  ├─ Last_active timestamp updated
  ├─ DMS countdown resets with each login
  └─ Executors see nothing yet (access granted but waiting)

Day 38: Inactivity Detected
  ├─ Alice hasn't logged in for 31 days
  ├─ Cron job runs (every 6 hours, let's say 2 AM)
  ├─ Query: SELECT * FROM dead_mans_switch WHERE status='active'
  ├─ For Alice's DMS:
  │  ├─ daysSinceCheckin = 31 days
  │  ├─ check_interval_days = 30 days
  │  ├─ 31 >= 30: TRUE → TRIGGER!
  │  ├─ UPDATE dead_mans_switch SET status='triggered'
  │  ├─ Query executors with access_granted=TRUE: Bob + Carol
  │  ├─ For each executor:
  │  │  ├─ Compose notification email
  │  │  ├─ Include:
  │  │  │  ├─ "Alice's digital estate is ready"
  │  │  │  ├─ Portal login link
  │  │  │  ├─ Asset summary (6 assets)
  │  │  │  └─ Instructions
  │  │  └─ sendExecutorNotificationEmail() async
  │  ├─ Also email Alice@example.com:
  │  │  ├─ Subject: "Your Dead Man's Switch was triggered"
  │  │  ├─ Content: "Estate unlocked, executors notified"
  │  │  └─ Recovery options if false alarm
  │  ├─ INSERT INTO user_activity ('dms_triggered', ...)
  │  └─ Log completion
  └─ Emails delivered within 1-5 minutes

Scenario Day 38-39: Executor Access
  ├─ Bob receives email from DIGIPASS
  ├─ Email contains:
  │  ├─ "Alice's Digital Estate Ready"
  │  ├─ "6 assets waiting for action"
  │  ├─ Portal URL: https://digipass-pi.vercel.app/executor-portal
  │  └─ Instructions: "Use your email and password to login"
  │
  ├─ Bob visits executor portal
  ├─ Clicks "Login" (already verified, has password)
  ├─ Enters: bob@example.com + BobPassword456
  ├─ POST /api/executors/login sent
  ├─ Backend:
  │  ├─ SELECT FROM executors WHERE email='bob@example.com'
  │  ├─ Check verification_status='verified' ✓
  │  ├─ Check access_granted=TRUE ✓
  │  ├─ bcrypt.compare(BobPassword456, hash) ✓
  │  ├─ SELECT FROM users WHERE user_id=5 (gets Alice info)
  │  ├─ jwt.sign({ executorId: 8, ownerUserId: 5 }, JWT_SECRET)
  │  └─ Returns token + executor/owner info
  ├─ Frontend saves token
  └─ Redirected to executor-dashboard.html

Scenario Day 39: Executor Reviews Assets
  ├─ Bob's portal shows:
  │  ├─ "Estate Owner: Alice (alice@example.com)"
  │  ├─ Table of 6 assets:
  │  │  ├─ Gmail (email) - Action: pass
  │  │  ├─ Netflix (entertainment) - Action: delete
  │  │  ├─ Chase Bank (finance) - Action: pass
  │  │  ├─ PayPal (finance) - Action: pass
  │  │  ├─ Twitter (social) - Action: last_message
  │  │  └─ Dropbox (storage) - Action: pass
  │  └─ Total: 6 assets
  │
  ├─ Bob clicks on "Gmail (email)"
  ├─ GET /api/executor-portal/assets/1 with executor JWT
  ├─ Backend returns:
  │  ├─ Platform: Gmail
  │  ├─ Account: alice@gmail.com
  │  ├─ Password: AliceGmailPwd789
  │  ├─ Action: pass
  │  └─ Message: (none)
  │
  ├─ Bob sees:
  │  ├─ Account username
  │  ├─ "Copy Account" button
  │  ├─ "Get Password" button (shows masked until clicked)
  │  ├─ Action: "Pass account to beneficiary (Carol)"
  │  └─ Instructions: "Update recovery email to Carol's"
  │
  └─ Bob plans action execution

Scenario Day 40: Execute Actions
  ├─ Bob gets Gmail password
  ├─ Logs into alice@gmail.com with AliceGmailPwd789
  ├─ Changes recovery email to carol@example.com
  ├─ Changes password to new one only Carol knows
  ├─ Updates account name: "Alice's Memorial Email"
  ├─ Marks "complete" in portal
  │
  ├─ Bob deletes Netflix account
  │  ├─ Opens Netflix
  │  ├─ Uses credentials to log in
  │  ├─ Navigates to account settings
  │  ├─ Clicks "Delete Account"
  │  ├─ Confirms deletion
  │  └─ Account permanently removed
  │
  ├─ Bob handles PayPal → transfer funds to Carol
  ├─ Bob handles Bank Account → call support for legacy account transfer
  │
  ├─ Bob posts final message on Twitter:
  │  └─ "Alice lived a wonderful life. Rest in peace."
  │  └─ Message posted to @alice's account
  │  └─ Followers see final tribute
  │
  └─ All assets handled according to Alice's instructions

End Result:
  ├─ All 6 assets processed
  ├─ Digital estate completely transferred
  ├─ Executors have full audit trail
  ├─ Complete activity log in DIGIPASS
  ├─ Family has access to all accounts
  └─ Alice's legacy preserved digitally
```

### Scenario 2: False Alarm (User Was Inactive, Then Comes Back)

```
Situation:
  ├─ Alice hasn't logged in for 31 days
  ├─ DMS triggers
  ├─ Bob and Carol get notification emails
  ├─ But Alice was just traveling without internet access
  ├─ She returns home on Day 39

Recovery Flow:
  ├─ Alice logs back in
  ├─ POST /api/auth/login with alice@example.com + password
  ├─ JWT token generated and stored
  ├─ Alice redirected to dashboard
  ├─ Dashboard loads
  │
  ├─ Frontend calls GET /api/dead-mans-switch/status
  ├─ Backend returns: status='triggered', daysUntilTrigger=0
  │
  ├─ Dashboard shows alert:
  │  ├─ "⚠️ Your Dead Man's Switch was triggered!"
  │  ├─ "Alert sent to executors"
  │  ├─ "Click 'Cancel' to reset (1-time use)"
  │  └─ "Contact executors immediately if false alarm"
  │
  ├─ Alice clicks "Cancel DMS"
  ├─ POST /api/dead-mans-switch/check-in sent
  ├─ Backend:
  │  ├─ UPDATE dead_mans_switch SET last_checkin=NOW(), status='active'
  │  ├─ UPDATE users SET last_active=NOW()
  │  ├─ INSERT INTO user_activity ('dms_checkin', ...)
  │  └─ Countdown reset to 30 days
  │
  ├─ Frontend updates display
  │  ├─ Alert removed
  │  ├─ DMS status: "Active"
  │  └─ "Days until trigger: 30"
  │
  └─ Alice contacts Bob and Carol by phone:
     ├─ "I'm home safe, DMS was a false alarm"
     ├─ "Please disregard the email"
     ├─ "I'm resetting my check-in timestamp"
     ├─ Executors relieved
     └─ Can log out of portal (estate doesn't need access yet)
```

---

## Summary

DIGIPASS is a comprehensive digital estate management system with multiple interconnected modules:

1. **Authentication Module** - Secure user/executor registration and login with JWT
2. **Assets Module** - Store, manage, and categorize digital account credentials
3. **Executors Module** - Verify and grant access to designated digital estate managers
4. **Will Module** - Auto-generate PDF wills with assets and instructions
5. **Dead Man's Switch** - Automatic trigger after user inactivity, notify executors
6. **Activity Module** - Complete audit log of all system actions
7. **Executor Portal** - Secure portal for executors to view and manage assets

The system employs multiple security layers:
- Bcrypt password hashing (10 rounds)
- JWT token authentication
- SQL parameterized queries
- CORS restrictions
- Role-based access control
- Audit logging

All data flows are carefully designed to ensure proper authorization, prevent unauthorized access, and maintain a complete audit trail for compliance and accountability.
