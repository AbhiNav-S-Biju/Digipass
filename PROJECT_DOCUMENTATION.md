# DIGIPASS - Digital Estate Management System
## Complete Project Documentation

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Architecture](#project-architecture)
4. [File Structure](#file-structure)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Frontend Structure](#frontend-structure)
8. [Authentication & Security](#authentication--security)
9. [Key Features](#key-features)
10. [Setup & Installation](#setup--installation)
11. [Development Guide](#development-guide)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**DIGIPASS** is a comprehensive Digital Estate Management System designed to help users manage, organize, and secure their digital assets. It allows users to designate executors who can access and manage digital accounts after death or incapacity.

### Core Purpose
- **Digital Asset Management**: Store and organize accounts for various platforms (social media, email, finance, storage, entertainment)
- **Executor Portal**: Designated individuals can verify their identity and gain controlled access to digital assets
- **Digital Will Generation**: Automatic PDF generation of a legal digital will document
- **Dead Man's Switch**: Automated scheduler that triggers will delivery if user doesn't respond within defined periods
- **Activity Logging**: Complete audit trail of all user actions and asset access

### Target Users
- Individual users wanting to organize their digital legacy
- Families managing shared digital assets
- Legal professionals handling digital estate matters

---

## 🛠 Technology Stack

### Backend
- **Runtime**: Node.js v22.19.0
- **Framework**: Express.js v4.18.2
- **Database**: PostgreSQL (Neon - Serverless Postgres)
- **Authentication**: JWT (jsonwebtoken v9.0.0)
- **Password Hashing**: bcryptjs v2.4.3
- **Email Service**: Resend v3.0.0
- **PDF Generation**: PDFKit v0.13.0
- **Scheduling**: node-cron v3.0.3
- **CORS**: cors v2.8.5
- **Environment**: dotenv v16.0.0

### Frontend
- **HTML5** with custom CSS3 (Bootstrap removed)
- **Vanilla JavaScript** (no framework dependencies)
- **Typography**: DM Serif Display & DM Sans (Google Fonts)
- **Design System**: Custom color palette with CSS custom properties

### Infrastructure
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render
- **Database**: Neon (PostgreSQL)
- **Version Control**: GitHub (abhinavbijusn/Digipass)

---

## 🏗 Project Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  (Frontend - Vercel)                                         │
│  - Authentication Pages (Register, Login)                    │
│  - User Dashboard                                            │
│  - Executor Portal Dashboard                                 │
│  - Asset Management UI                                       │
│  - Will Generation Interface                                 │
└─────────────────────────────────────────────────────────────┘
                           ↕ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (Express.js)                    │
│  (Backend - Render on localhost:3000)                        │
│                                                               │
│  ┌──────────────────┐  ┌──────────────────────────────────┐ │
│  │ Authentication   │  │ Business Logic                   │ │
│  │ - Register       │  │ - Asset Management               │ │
│  │ - Login          │  │ - Executor Management            │ │
│  │ - Token Verify   │  │ - Will Generation                │ │
│  │ - Get User Info  │  │ - Dead Man's Switch              │ │
│  └──────────────────┘  │ - Activity Logging               │ │
│                        │ - Access Control                 │ │
│                        └──────────────────────────────────┘ │
│                                                               │
│  ┌──────────────────┐  ┌──────────────────────────────────┐ │
│  │ Middleware       │  │ Database Layer                   │ │
│  │ - JWT Auth       │  │ - Query Builders                 │ │
│  │ - Executor Auth  │  │ - Error Handling                 │ │
│  │ - Error Handler  │  │ - Connection Pool                │ │
│  │ - Rate Limiting  │  │ - Transaction Management         │ │
│  └──────────────────┘  └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           ↕ TCP/IP
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                            │
│  (PostgreSQL - Neon)                                         │
│  - users table                                               │
│  - digital_assets table                                      │
│  - executors table                                           │
│  - digital_will table                                        │
│  - dead_mans_switch table                                    │
│  - user_activity table                                       │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow Example (Asset Creation)

```
1. User fills asset form in dashboard (Frontend)
2. Form validation on client-side
3. POST /api/assets with JWT token (Backend)
4. authenticateToken middleware extracts user from JWT
5. assetsController.addAsset validates input
6. Insert into digital_assets table
7. Log activity to user_activity table
8. Return success response with asset ID
9. Update UI with new asset (Frontend)
```

---

## 📁 File Structure

```
DIGIPASS/
│
├── 📄 server.js                      # Main Express app entry point
├── 📄 db.js                          # PostgreSQL connection pool
├── 📄 package.json                   # Dependencies & scripts
├── 📄 .env                           # Environment variables (local)
├── 📄 .env.production                # Environment variables (production)
│
├── 📂 controllers/                   # Business logic handlers
│   ├── authController.js             # User registration & login
│   ├── assetsController.js           # Digital asset management
│   ├── executorsController.js        # Executor management
│   ├── executorPortalController.js   # Executor portal logic
│   ├── willController.js             # Will generation
│   └── assetInstructionsController.js # Asset-specific instructions
│
├── 📂 routes/                        # API endpoint definitions
│   ├── authRoutes.js                 # /api/auth/* endpoints
│   ├── assetsRoutes.js               # /api/assets/* endpoints
│   ├── executorsRoutes.js            # /api/executors/* endpoints
│   ├── executorPortalRoutes.js       # /api/executor/* endpoints
│   ├── willRoutes.js                 # /api/generate-will, /api/download-will
│   ├── deadMansSwitchRoutes.js       # /api/dead-mans-switch/* endpoints
│   └── activityRoutes.js             # /api/activity/* endpoints
│
├── 📂 middleware/                    # Express middleware
│   ├── auth.js                       # JWT authentication
│   ├── executorAuth.js               # Executor JWT authentication
│   └── errorHandler.js               # Global error handling
│
├── 📂 utils/                         # Utility functions
│   ├── jwt.js                        # Token generation & verification
│   ├── bcrypt.js                     # Password hashing & comparison
│   ├── mailer.js                     # Email sending (Resend)
│   ├── dbInit.js                     # Database table initialization
│   ├── errorHandler.js               # Custom error classes
│   ├── validation.js                 # Input validation functions
│   ├── logger.js                     # Application logging
│   ├── rateLimiter.js                # Rate limiting configuration
│   ├── activityLogger.js             # Activity tracking
│   ├── crypto.js                     # Encryption utilities
│   ├── deadMansSwitchScheduler.js    # Cron job scheduler
│   ├── executorVerification.js       # Executor email verification
│   └── willPdf.js                    # PDF generation
│
├── 📂 migrations/                    # Database migration scripts
│   ├── 001_create_digital_assets.sql
│   ├── 002_create_executors.sql
│   ├── 003_create_digital_will.sql
│   ├── 004_create_dead_mans_switch.sql
│   ├── 005_add_executor_verification_tokens.sql
│   └── 006_add_executor_password_hash.sql
│
├── 📂 frontend/                      # Frontend assets
│   ├── index.html                    # Home page
│   ├── register.html                 # User registration
│   ├── login.html                    # User login
│   ├── dashboard.html                # User dashboard
│   ├── executor-login.html           # Executor login
│   ├── executor-register.html        # Executor registration
│   ├── executor-dashboard.html       # Executor portal
│   │
│   ├── 📂 css/                       # Stylesheets
│   │   ├── style.css                 # Global styles
│   │   ├── auth.css                  # Auth pages styles
│   │   └── dashboard.css             # Dashboard styles
│   │
│   ├── 📂 js/                        # Frontend scripts
│   │   ├── utils.js                  # Helper functions & API wrapper
│   │   ├── auth.js                   # Auth page logic
│   │   ├── login.js                  # Login page logic
│   │   ├── register.js               # Register page logic
│   │   ├── dashboard.js              # Dashboard logic
│   │   ├── executor-login.js         # Executor login logic
│   │   ├── executor-register.js      # Executor registration logic
│   │   └── executor-dashboard.js     # Executor dashboard logic
│   │
│   ├── 📂 assets/                    # Images, icons (if any)
│   └── 📂 pages/                     # Additional pages
│
├── 📂 backend/                       # Alternative backend structure
│   ├── config/
│   │   ├── database.js
│   │   └── migrate.js
│   └── src/
│       ├── server.js
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── utils/
│
├── 📂 logs/                          # Application logs
│
├── 📂 generated-wills/               # Generated PDF wills
│
├── 📂 .agents/                       # AI agent configurations
│
├── 📂 migrations/                    # Database schema migrations
│
└── 📚 Documentation Files
    ├── PROJECT_DOCUMENTATION.md      # This file
    ├── ARCHITECTURE.md               # Architecture details
    ├── AUTHENTICATION.md             # Auth documentation
    ├── SETUP.md                      # Setup instructions
    ├── DEPLOYMENT_README.md          # Deployment guide
    ├── MANUAL_TESTING.md             # Testing procedures
    └── ... (other documentation)

```

---

## 🗄 Database Schema

### Overview
The database uses PostgreSQL with Neon (serverless). All tables are automatically initialized on first server start via `utils/dbInit.js`.

### Table Structures

#### 1. **users** Table
Stores user account information.

```sql
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_active TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

**Fields:**
- `user_id`: Auto-incrementing primary key
- `full_name`: User's full name
- `email`: Unique email address (case-insensitive)
- `password_hash`: Bcrypt hashed password
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp
- `last_active`: Last login/activity timestamp

---

#### 2. **digital_assets** Table
Stores user's digital account credentials and instructions.

```sql
CREATE TABLE digital_assets (
  asset_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  asset_name VARCHAR(255) DEFAULT 'N/A',
  asset_type VARCHAR(50) DEFAULT 'account',
  encrypted_data TEXT DEFAULT '',
  platform_name VARCHAR(255),
  category VARCHAR(100),
  account_identifier VARCHAR(255),
  account_password TEXT,
  action_type VARCHAR(50),
  last_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_digital_assets_user_id ON digital_assets(user_id);
CREATE INDEX idx_digital_assets_created_at ON digital_assets(created_at DESC);
```

**Fields:**
- `asset_id`: Auto-incrementing primary key
- `user_id`: Foreign key to users table
- `platform_name`: Name of platform (Gmail, Instagram, etc.)
- `category`: Category type (social, email, finance, storage, entertainment, other)
- `account_identifier`: Username or email for the account
- `account_password`: Password for the account
- `action_type`: What to do with account (pass, delete, last_message)
- `last_message`: Final message if action_type is 'last_message'
- `created_at`: When asset was added
- `updated_at`: Last modification timestamp

**Action Types:**
- `pass`: Pass account to executor with full access
- `delete`: Delete account permanently
- `last_message`: Post a final message to the account

---

#### 3. **executors** Table
Stores information about designated executors (digital estate managers).

```sql
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
```

**Fields:**
- `executor_id`: Auto-incrementing primary key
- `user_id`: User who designated this executor
- `executor_name`: Full name of executor
- `executor_email`: Email address of executor
- `executor_phone`: Contact phone number
- `relationship`: Relationship to user (spouse, child, attorney, etc.)
- `verification_status`: pending, verified, rejected
- `access_granted`: Boolean - whether executor can access assets
- `executor_password_hash`: Bcrypt hash of executor's password
- `verification_token_hash`: Email verification token
- `verification_token_expires_at`: When token expires
- `verification_sent_at`: When verification email was sent

---

#### 4. **digital_will** Table
Stores generated digital will documents.

```sql
CREATE TABLE digital_will (
  will_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  will_content TEXT,
  pdf_path VARCHAR(255),
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_digital_will_user_id ON digital_will(user_id);
```

**Fields:**
- `will_id`: Auto-incrementing primary key
- `user_id`: Owner of the will
- `will_content`: Full will text/HTML
- `pdf_path`: Path to stored PDF file
- `generated_at`: When will was generated
- `updated_at`: Last update timestamp

---

#### 5. **dead_mans_switch** Table
Stores configuration for automatic will delivery.

```sql
CREATE TABLE dead_mans_switch (
  switch_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  check_interval_days INTEGER DEFAULT 90,
  last_check_date TIMESTAMP,
  is_active BOOLEAN DEFAULT FALSE,
  delivery_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_dead_mans_switch_user_id ON dead_mans_switch(user_id);
```

**Fields:**
- `switch_id`: Auto-incrementing primary key
- `user_id`: User who set up the switch
- `check_interval_days`: How often to check for user activity
- `last_check_date`: Last time user confirmed they're alive
- `is_active`: Whether the dead man's switch is enabled
- `delivery_email`: Email to send will to if switch triggers

---

#### 6. **user_activity** Table
Audit log of all user actions.

```sql
CREATE TABLE user_activity (
  activity_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  entity_type VARCHAR(50),
  entity_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_user_activity_user_id ON user_activity(user_id, created_at DESC);
```

**Fields:**
- `activity_id`: Auto-incrementing primary key
- `user_id`: User who performed action
- `action_type`: Type of action (asset_created, asset_deleted, executor_added, etc.)
- `description`: Human-readable description
- `entity_type`: Type of entity affected (asset, executor, will, etc.)
- `entity_id`: ID of affected entity
- `created_at`: When action occurred

---

### Database Relationships

```
users (1) ──────────── (N) digital_assets
  │                    (stores account credentials)
  │
  ├──────── (N) executors
  │         (designated digital estate managers)
  │
  ├──────── (N) digital_will
  │         (generated wills)
  │
  ├──────── (N) dead_mans_switch
  │         (automatic delivery triggers)
  │
  └──────── (N) user_activity
            (action audit log)
```

---

## 🔌 API Endpoints

### Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://digipass-3l63.onrender.com`

### Authentication Headers
Protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

---

### 1. Authentication Endpoints (`/api/auth`)

#### Register User
```
POST /api/auth/register
Content-Type: application/json

Request Body:
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response (201):
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": 1,
    "fullName": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGc..."
  }
}
```

**Validation:**
- Full name: 2-100 characters
- Email: Valid email format, unique
- Password: Min 8 chars, uppercase, lowercase, number, symbol

---

#### Login User
```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": 1,
    "fullName": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGc..."
  }
}
```

---

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <TOKEN>

Response (200):
{
  "success": true,
  "data": {
    "userId": 1,
    "fullName": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### 2. Assets Endpoints (`/api/assets`)

#### Get All Assets
```
GET /api/assets
Authorization: Bearer <TOKEN>

Response (200):
{
  "success": true,
  "data": [
    {
      "asset_id": 1,
      "platform_name": "Gmail",
      "category": "email",
      "account_identifier": "john@gmail.com",
      "action_type": "pass",
      "created_at": "2026-04-19T10:30:00Z"
    },
    ...
  ]
}
```

---

#### Add Asset
```
POST /api/assets
Authorization: Bearer <TOKEN>
Content-Type: application/json

Request Body:
{
  "platform_name": "Gmail",
  "category": "email",
  "account_identifier": "john@gmail.com",
  "account_password": "EncryptedPassword",
  "action_type": "pass",
  "last_message": null
}

Response (201):
{
  "success": true,
  "message": "Asset added successfully",
  "data": {
    "asset_id": 1,
    "platform_name": "Gmail",
    "category": "email",
    "account_identifier": "john@gmail.com",
    "action_type": "pass",
    "created_at": "2026-04-19T10:30:00Z"
  }
}
```

**Valid Categories:**
- `social`: Instagram, Facebook, Twitter, LinkedIn, TikTok, Snapchat, Discord
- `email`: Gmail, Outlook, Yahoo Mail, ProtonMail, Apple Mail
- `finance`: PayPal, Amazon, Banking App, Stripe, Square
- `storage`: Google Drive, Dropbox, OneDrive, iCloud
- `entertainment`: Netflix, Spotify, Disney+, Hulu
- `other`: Other platforms

**Action Types:**
- `pass`: Transfer to executor
- `delete`: Delete permanently
- `last_message`: Post final message

---

#### Delete Asset
```
DELETE /api/assets/:id
Authorization: Bearer <TOKEN>

Response (200):
{
  "success": true,
  "message": "Asset deleted successfully"
}
```

---

### 3. Executors Endpoints (`/api/executors`)

#### Get All Executors
```
GET /api/executors
Authorization: Bearer <TOKEN>

Response (200):
{
  "success": true,
  "data": [
    {
      "executor_id": 1,
      "executor_name": "Jane Doe",
      "executor_email": "jane@example.com",
      "relationship": "Spouse",
      "verification_status": "verified",
      "access_granted": true,
      "created_at": "2026-04-19T10:30:00Z"
    },
    ...
  ]
}
```

---

#### Add Executor
```
POST /api/executors
Authorization: Bearer <TOKEN>
Content-Type: application/json

Request Body:
{
  "executor_name": "Jane Doe",
  "executor_email": "jane@example.com",
  "executor_phone": "+1234567890",
  "relationship": "Spouse"
}

Response (201):
{
  "success": true,
  "message": "Executor added and verification email sent",
  "data": {
    "executor_id": 1,
    "executor_name": "Jane Doe",
    "executor_email": "jane@example.com",
    "verification_status": "pending"
  }
}
```

---

#### Delete Executor
```
DELETE /api/executors/:id
Authorization: Bearer <TOKEN>

Response (200):
{
  "success": true,
  "message": "Executor deleted successfully"
}
```

---

#### Verify Executor (via email link)
```
GET /api/executors/verify?token=<VERIFICATION_TOKEN>

Response (200):
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

### 4. Executor Portal Endpoints (`/api/executor`)

#### Executor Login
```
POST /api/executor/login
Content-Type: application/json

Request Body:
{
  "executor_email": "jane@example.com",
  "password": "ExecutorPass123!"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "executorId": 1,
    "token": "eyJhbGc..."
  }
}
```

---

#### Register Executor (after email verification)
```
POST /api/executor/register
Content-Type: application/json

Request Body:
{
  "executor_email": "jane@example.com",
  "verification_token": "token_from_email",
  "password": "ExecutorPass123!"
}

Response (201):
{
  "success": true,
  "message": "Executor registered successfully",
  "data": {
    "executorId": 1,
    "token": "eyJhbGc..."
  }
}
```

---

#### Get Executor Assets (what executor can access)
```
GET /api/executor/assets
Authorization: Bearer <EXECUTOR_TOKEN>

Response (200):
{
  "success": true,
  "data": [
    {
      "asset_id": 1,
      "platform_name": "Gmail",
      "category": "email",
      "account_identifier": "john@gmail.com",
      "action_type": "pass"
    },
    ...
  ]
}
```

---

### 5. Will Generation Endpoints (`/api`)

#### Generate Will
```
GET /api/generate-will
Authorization: Bearer <TOKEN>

Response (200):
{
  "success": true,
  "data": {
    "will_id": 1,
    "will_content": "...",
    "generated_at": "2026-04-19T10:30:00Z"
  }
}
```

---

#### Download Will PDF
```
GET /api/download-will/:willId
Authorization: Bearer <TOKEN>

Response: PDF file binary data
```

---

### 6. Dead Man's Switch Endpoints (`/api/dead-mans-switch`)

#### Set Up Dead Man's Switch
```
POST /api/dead-mans-switch/setup
Authorization: Bearer <TOKEN>
Content-Type: application/json

Request Body:
{
  "check_interval_days": 90,
  "delivery_email": "executor@example.com"
}

Response (201):
{
  "success": true,
  "message": "Dead man's switch activated",
  "data": {
    "switch_id": 1,
    "check_interval_days": 90,
    "is_active": true
  }
}
```

---

#### Confirm User is Alive
```
POST /api/dead-mans-switch/confirm
Authorization: Bearer <TOKEN>

Response (200):
{
  "success": true,
  "message": "Check-in recorded. Will not be delivered for 90 days."
}
```

---

### 7. Activity Log Endpoints (`/api/activity`)

#### Get User Activity Log
```
GET /api/activity
Authorization: Bearer <TOKEN>

Query Parameters:
- limit: Number of records (default: 20)
- offset: Pagination offset (default: 0)

Response (200):
{
  "success": true,
  "data": [
    {
      "activity_id": 1,
      "action_type": "asset_created",
      "description": "Asset created: Gmail",
      "entity_type": "asset",
      "entity_id": 1,
      "created_at": "2026-04-19T10:30:00Z"
    },
    ...
  ]
}
```

---

### 8. Health Check Endpoint

#### Health Check
```
GET /api/health

Response (200):
{
  "success": true,
  "message": "DIGIPASS API Running",
  "timestamp": "2026-04-19T10:30:00Z"
}
```

---

## 🎨 Frontend Structure

### Pages Overview

#### 1. **index.html** - Home Page
- Landing page with project overview
- Navigation to register/login
- Feature highlights

#### 2. **register.html** - User Registration
- New account creation form
- Real-time password strength meter
- Terms of Service acceptance
- Floating card design with SVG decorations

**Form Fields:**
- Full Name (required)
- Email (required, unique validation)
- Password (required, strength validation)
- Confirm Password (required, must match)
- Agree to Terms (checkbox, required)

**Features:**
- Password strength meter (4 segments: length, uppercase, number, symbol)
- Form validation before submission
- Error message display
- Success redirect to dashboard

#### 3. **login.html** - User Sign In
- Email/password authentication
- Forgot password link
- Support link for login issues
- Consistent design with register page

**Form Fields:**
- Email (required)
- Password (required)

**Features:**
- Form validation
- Error handling
- Token storage in localStorage
- Redirect to dashboard on success

#### 4. **dashboard.html** - Main User Dashboard
- Asset management interface
- Executor management
- Will generation
- Dead man's switch setup
- Activity log viewer

**Key Sections:**
1. **Asset Management**
   - Add new asset form
   - Display all assets in table format
   - Delete asset functionality
   - Platform categorization

2. **Executor Management**
   - Add executor form
   - Display executors list
   - Verification status display
   - Delete executor option

3. **Will Management**
   - Generate will button
   - Download will PDF
   - View generated will content

4. **Dead Man's Switch**
   - Setup/configure automation
   - Check-in to confirm alive
   - View next trigger date

5. **Activity Log**
   - Display recent user activities
   - Pagination support
   - Filter by action type

#### 5. **executor-login.html** - Executor Sign In
- Email/password form for designated executors
- Security notice explaining access restrictions
- Vault door SVG illustration

**Features:**
- Executor-specific authentication
- Verification status check
- Warning about access monitoring
- Redirect to executor dashboard

#### 6. **executor-register.html** - Executor Registration
- Registration form for verified executors
- Email verification requirement
- Password setup

**Fields:**
- Email (pre-filled from verification)
- Verification Token (from email)
- Password (required)
- Confirm Password

#### 7. **executor-dashboard.html** - Executor Portal
- View accessible digital assets
- Asset details and instructions
- Limited access based on permissions
- Activity logging

**Features:**
- Display only assets marked for executor access
- Show platform credentials securely
- Display final message if applicable
- Action instructions for asset management

---

### Frontend Design System

#### Typography
- **Serif (Titles)**: DM Serif Display (Google Fonts)
  - Logo branding
  - Page titles
  - Card headers

- **Sans-serif (Body)**: DM Sans (Google Fonts)
  - Body text
  - Form labels
  - Button text
  - Navigation

#### Color Palette
```css
--cream: #f5ead8              /* Page background */
--cream-light: #fdf6ec        /* Input backgrounds */
--forest: #1b3a2d             /* Primary buttons */
--forest-mid: #2d5a42         /* Button hover */
--forest-light: #3d7a5a       /* Links, focus */
--sand: #e8d9c0               /* Accents, badges */
--sand-deep: #d4c4a0          /* Borders */
--text-dark: #1a2e22          /* Primary text */
--text-muted: #5a7260         /* Secondary text */
```

#### Components
- **Buttons**: Forest green, hover darkens to forest-mid
- **Inputs**: Cream-light background, sand-deep border, 1px width
- **Cards**: White background, 20px border-radius, 36px padding
- **Links**: Forest-light color, no underline on hover
- **Badges**: Sand background, dark text, 8px padding, rounded

#### Responsive Design
- **Mobile**: < 640px width
  - Single column layout
  - Hidden SVG decorations
  - Reduced padding
  - Larger touch targets

- **Desktop**: >= 640px width
  - Full decorative SVG layer
  - Multi-column layouts
  - Standard padding
  - Floating card layout

---

## 🔐 Authentication & Security

### JWT (JSON Web Token) Implementation

#### Token Generation
```javascript
// In utils/jwt.js
const generateToken = (userId) => {
  return jwt.sign(
    { userId: userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};
```

#### Token Verification
```javascript
const verifyToken = (token) => {
  try {
    return jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    );
  } catch (err) {
    return null;
  }
};
```

**Token Lifespan**: 7 days

---

### Password Security

#### Hashing (Bcrypt)
```javascript
// In utils/bcrypt.js
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
```

**Bcrypt Salt Rounds**: 10

---

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*)

---

### Email Verification Flow (Executors)

```
1. User adds executor
   ↓
2. Verification email sent to executor
   ↓
3. Executor clicks email link with token
   ↓
4. Token validated and executor marked as verified
   ↓
5. Executor sets password and registers
   ↓
6. Executor can now login and access assets
```

**Token Expiration**: 24 hours

---

### Rate Limiting
Prevents brute force attacks:
- **Login/Register**: 5 attempts per 15 minutes per IP
- **General API**: 100 requests per 15 minutes per IP

---

### CORS Configuration
```javascript
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:3000',
  'https://yourfrontend.vercel.app'
];
```

---

### Data Protection
- All passwords hashed with bcrypt
- Executor passwords hashed separately
- Sensitive data never logged
- No plain text passwords in database
- HTTPS enforced in production

---

## ⭐ Key Features

### 1. Digital Asset Management
- **Add Assets**: Store account credentials for any platform
- **Categorization**: Organize by type (social, email, finance, storage, entertainment)
- **Action Instructions**: Specify what to do with each account:
  - Pass to executor
  - Delete permanently
  - Post final message
- **Secure Storage**: Passwords encrypted in database

### 2. Executor Management
- **Designation**: Assign multiple executors (family, attorney, etc.)
- **Relationship Tracking**: Record relationship to user
- **Email Verification**: Verify executor ownership of email
- **Access Control**: Grant/revoke access individually
- **Two-Factor**: Password requirement after email verification

### 3. Digital Will Generation
- **Automatic PDF**: Generate legal-style digital will
- **Asset Summary**: Include all registered assets
- **Executor Information**: List designated executors
- **Instructions**: Clear instructions for asset management
- **Timestamp**: Generated date and time

**Will Contents:**
- User name and email
- List of digital assets with action types
- List of executors with contact info
- Instructions for access
- Digital signature space

### 4. Dead Man's Switch
- **Automated Triggers**: Send will if user inactive
- **Configurable Interval**: 30-365 day check-in periods
- **Check-In Mechanism**: User confirms they're alive
- **Email Delivery**: Will sent to designated recipients
- **Scheduler**: Node-cron runs daily at midnight

**How it works:**
1. User enables dead man's switch
2. Selects check-in interval (e.g., 90 days)
3. Sets email recipients
4. Scheduler checks daily
5. If user hasn't checked in, will is sent

### 5. Activity Logging
- **Comprehensive Audit Trail**: Every action logged
- **Action Types**:
  - asset_created
  - asset_deleted
  - executor_added
  - executor_removed
  - executor_verified
  - will_generated
  - will_downloaded
  - access_granted
  - access_revoked
  
- **User Dashboard**: View personal activity history
- **Timestamps**: Precise action timing
- **Entity Tracking**: Know which asset/executor affected

### 6. Multi-Role Access Control

**User Role Permissions:**
- Create/read/update/delete own assets
- Add/remove/manage executors
- Generate and download will
- Configure dead man's switch
- View own activity log
- Cannot access other users' data

**Executor Role Permissions:**
- View only assigned assets
- Read asset credentials
- Cannot modify or delete assets
- Cannot access other executors' assets
- Cannot view user activity (privacy)
- All access is logged

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js v22.19.0 or higher
- PostgreSQL database (local or Neon)
- npm or yarn package manager
- Git for version control

### Local Development Setup

#### 1. Clone Repository
```bash
git clone https://github.com/AbhiNav-S-Biju/Digipass.git
cd Digipass
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Environment Configuration

**Create `.env` file:**
```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=digipass

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@digipass.app

# App
NODE_ENV=development
APP_BASE_URL=http://localhost:3000

# CORS
CORS_ORIGIN=http://localhost:8080,http://localhost:3000
```

#### 4. Database Setup

**Option A: Local PostgreSQL**
```bash
# Create database
createdb digipass

# Run migration scripts (optional, auto-runs on first request)
psql digipass < migrations/001_create_digital_assets.sql
psql digipass < migrations/002_create_executors.sql
psql digipass < migrations/003_create_digital_will.sql
psql digipass < migrations/004_create_dead_mans_switch.sql
psql digipass < migrations/005_add_executor_verification_tokens.sql
psql digipass < migrations/006_add_executor_password_hash.sql
```

**Option B: Neon (Serverless)**
```
DB_HOST=xxxxx.neon.tech
DB_USER=neondb_owner
DB_PASSWORD=your_neon_password
DB_NAME=digipass
DB_PORT=5432
```

#### 5. Start Development Server
```bash
npm start
```

Server runs on `http://localhost:3000`

#### 6. Test API Health
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "DIGIPASS API Running",
  "timestamp": "2026-04-19T10:30:00Z"
}
```

---

### Production Deployment Setup

See [Deployment](#deployment) section below.

---

## 👨‍💻 Development Guide

### Code Organization Principles

#### Controllers
- Handle HTTP request/response
- Validate input
- Call services/database
- Return formatted responses
- Minimal business logic

```javascript
// Example: assetsController.js
async function addAsset(req, res) {
  try {
    const userId = getAuthenticatedUserId(req);
    const { platform_name, category, ... } = req.body;
    
    // Validation
    if (!platform_name) {
      return res.status(400).json({...});
    }
    
    // Database operation
    const result = await pool.query(...);
    
    // Logging
    await logActivity(...);
    
    // Response
    res.status(201).json({...});
  } catch (error) {
    res.status(500).json({...});
  }
}
```

#### Routes
- Define endpoint paths
- Map to controllers
- Apply middleware
- Handle HTTP methods

```javascript
// Example: assetsRoutes.js
const router = express.Router();

router.use(authMiddleware);
router.post('/', addAsset);
router.get('/', getAssets);
router.delete('/:id', deleteAsset);

module.exports = router;
```

#### Middleware
- Authentication/Authorization
- Request validation
- Error handling
- Logging

```javascript
// Example: auth.js
const authenticateToken = (req, res, next) => {
  const token = extractToken(req);
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(403).json({...});
  }
  
  req.userId = decoded.userId;
  next();
};
```

#### Utilities
- Reusable functions
- Helper methods
- Configuration
- Third-party integrations

```javascript
// Example: jwt.js
const generateToken = (userId) => {...};
const verifyToken = (token) => {...};

// Example: mailer.js
const sendEmail = (to, subject, html) => {...};
```

---

### Adding New Features

#### Example: Add a New Asset Type

1. **Update Database**
```sql
ALTER TABLE digital_assets
ADD COLUMN asset_status VARCHAR(20) DEFAULT 'active';
```

2. **Update Controller**
```javascript
// In assetsController.js
const { asset_status } = req.body;
// Add validation and insert
```

3. **Create Route**
```javascript
// In assetsRoutes.js
router.patch('/:id/status', updateAssetStatus);
```

4. **Add Frontend UI**
```html
<!-- In dashboard.html -->
<select id="assetStatus">
  <option>active</option>
  <option>inactive</option>
</select>
```

5. **Frontend Logic**
```javascript
// In dashboard.js
const updateStatus = async (assetId, newStatus) => {
  const response = await apiCall(`/assets/${assetId}/status`, 'PATCH', {
    asset_status: newStatus
  });
};
```

---

### Common Tasks

#### Adding a New Endpoint
1. Create method in appropriate controller
2. Add route to corresponding routes file
3. Add middleware if authentication needed
4. Write test cases
5. Document in API section
6. Update frontend if needed

#### Modifying Database Schema
1. Create migration file in `/migrations`
2. Update initialization in `utils/dbInit.js`
3. Test with fresh database
4. Update model documentation
5. Handle backward compatibility if needed

#### Adding Email Functionality
1. Set up Resend API key in `.env`
2. Use `utils/mailer.js` sendEmail function
3. Create email template
4. Add queue logic if needed
5. Test in development first

---

## 🌐 Deployment

### Frontend Deployment (Vercel)

#### 1. Connect GitHub Repository
- Go to vercel.com
- Select "Import Project"
- Connect Digipass GitHub repository
- Authorize access

#### 2. Configure Project
```
Framework Preset: Other
Root Directory: ./frontend
Output Directory: (leave empty)
```

#### 3. Environment Variables
```
VITE_API_URL=https://digipass-3l63.onrender.com
```

#### 4. Deploy
- Automatic on push to main
- Preview for pull requests
- Production on merge

**Frontend URL**: https://digipass-frontend.vercel.app

---

### Backend Deployment (Render)

#### 1. Connect GitHub
- Go to render.com
- Create New > Web Service
- Connect GitHub Digipass repo

#### 2. Configure Service
```
Name: digipass-api
Region: Singapore (or your choice)
Branch: main
Runtime: Node
Build Command: npm install
Start Command: npm start
```

#### 3. Set Environment Variables
```
NODE_ENV=production
JWT_SECRET=<your-secret>
DB_HOST=<neon-host>
DB_USER=neondb_owner
DB_PASSWORD=<neon-password>
DB_NAME=digipass
RESEND_API_KEY=<your-key>
EMAIL_FROM=noreply@digipass.app
CORS_ORIGIN=https://digipass-frontend.vercel.app
APP_BASE_URL=https://digipass-3l63.onrender.com
```

#### 4. Deploy
- Automatic on push to main
- Check build logs for errors

**Backend URL**: https://digipass-3l63.onrender.com

---

### Database Deployment (Neon)

#### 1. Create Neon Project
- Go to console.neon.tech
- Create new project
- Select region

#### 2. Get Connection String
```
postgresql://user:password@host:5432/database
```

#### 3. Connection in Code
Already configured in `db.js`:
```javascript
ssl: process.env.DB_HOST?.includes('neon.tech') ? { rejectUnauthorized: false } : false
```

#### 4. Run Migrations
```bash
# Connect to Neon database
PGPASSWORD=<password> psql -h <host> -U <user> -d <database>

# Run migration files
\i migrations/001_create_digital_assets.sql
\i migrations/002_create_executors.sql
... (etc)
```

---

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL/HTTPS enabled
- [ ] CORS properly configured
- [ ] Email service working (test with executor verification)
- [ ] Frontend can reach backend API
- [ ] JWT secret changed from default
- [ ] Database credentials secured
- [ ] Rate limiting enabled
- [ ] Error logging working
- [ ] Health check endpoint responds

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. 500 Error on Asset Creation
**Symptom**: POST /api/assets returns 500

**Causes & Solutions:**
```
1. Missing account_password column in database
   → Run: ALTER TABLE digital_assets ADD COLUMN account_password TEXT;

2. Legacy NOT NULL constraints on old columns
   → Run: ALTER TABLE digital_assets ALTER COLUMN asset_name DROP NOT NULL;

3. Missing database tables
   → Server will auto-create on startup, check logs
```

#### 2. JWT Token Expired
**Symptom**: 403 Invalid or expired token

**Solution:**
```javascript
// Token lifespan is 7 days
// User must login again to get new token
// Implement refresh token rotation for better UX
```

#### 3. Email Verification Not Sending
**Symptom**: Executor verification email not received

**Causes:**
```
1. RESEND_API_KEY not set
   → Check .env file

2. Invalid email format
   → Validate in request body

3. Email bouncing
   → Check Resend dashboard for bounce logs

4. Rate limited
   → Check rate limiter configuration
```

#### 4. Database Connection Error
**Symptom**: "Error: connect ECONNREFUSED"

**Solutions:**
```
Local Development:
- Check PostgreSQL is running: sudo service postgresql status
- Verify credentials in .env
- Test connection: psql -U postgres

Neon:
- Check connection string format
- Verify IP whitelist (if enabled)
- Test with psql directly
```

#### 5. CORS Error
**Symptom**: No 'Access-Control-Allow-Origin' header

**Solution:**
```javascript
// Check CORS_ORIGIN in .env includes frontend URL
CORS_ORIGIN=https://yourfrontend.vercel.app,http://localhost:3000

// If local development, ensure correct port
```

#### 6. Password Strength Validation Fails
**Symptom**: Registration fails with password error

**Password Requirements:**
- 8+ characters
- 1+ uppercase (A-Z)
- 1+ lowercase (a-z)
- 1+ number (0-9)
- 1+ special character (!@#$%^&*)

**Example Valid**: `MyP@ss123!`

---

### Debugging Tips

#### Check Server Logs
```bash
# In terminal where server runs
npm start

# Look for error messages with [DB], [Error], [Auth] prefixes
```

#### Test Endpoints with curl
```bash
# Health check
curl http://localhost:3000/api/health

# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test","email":"test@test.com","password":"TestPass123!"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"TestPass123!"}'
```

#### Check Database
```bash
# Connect to database
psql -U postgres -d digipass

# View tables
\dt

# Check users table
SELECT * FROM users;

# Check digital_assets table
SELECT * FROM digital_assets;
```

#### Browser Developer Tools
1. Open Network tab
2. Check request/response headers
3. Look for error status codes (4xx, 5xx)
4. Check localStorage for token
5. Console for JavaScript errors

---

### Performance Optimization

#### Database Indexes
Already created for:
- `users.email` - Fast email lookups
- `digital_assets.user_id` - Fast asset filtering
- `executors.user_id` - Fast executor filtering
- `user_activity.(user_id, created_at)` - Composite index for logs

#### Query Optimization
```javascript
// Use LIMIT and OFFSET for pagination
const limit = 20;
const offset = (page - 1) * limit;
await pool.query('SELECT * FROM table LIMIT $1 OFFSET $2', [limit, offset]);

// Use indexes in WHERE clauses
await pool.query('SELECT * FROM users WHERE email = $1', [email]);
```

#### Caching Strategy
```javascript
// Cache user data after login
localStorage.setItem('user', JSON.stringify(user));
localStorage.setItem('token', token);

// Use memory caching for executors
const executorCache = new Map();
```

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks

**Weekly:**
- Check error logs for patterns
- Monitor database size
- Review user activity

**Monthly:**
- Update dependencies
- Test backup/restore process
- Review security vulnerabilities

**Quarterly:**
- Performance optimization
- User feedback incorporation
- Feature planning

---

## 📝 Additional Resources

- [GitHub Repository](https://github.com/AbhiNav-S-Biju/Digipass)
- [Render Dashboard](https://dashboard.render.com)
- [Neon Console](https://console.neon.tech)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Express.js Docs](https://expressjs.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [JWT.io](https://jwt.io)

---

## 📄 Document Version

- **Version**: 1.0
- **Last Updated**: April 19, 2026
- **Author**: Abhinav Biju
- **Status**: Complete & Production Ready

---

**End of Documentation**
