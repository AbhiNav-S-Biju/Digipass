# 🏗️ Authentication System Architecture

## 📐 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Browser)                       │
│  register.html / login.html / dashboard.html               │
│  frontend/js/register.js, login.js, utils.js               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP Requests
                     │ JSON with credentials
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                 EXPRESS SERVER (Port 3000)                  │
│                                                              │
│  POST /api/auth/register  →  authController.register()      │
│  POST /api/auth/login     →  authController.login()         │
│  GET  /api/auth/me        →  authMiddleware ↓ controller    │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Query with parameterized values
                     │ INSERT / SELECT with hashed password
                     ↓
┌─────────────────────────────────────────────────────────────┐
│         POSTGRESQL DATABASE (Port 5432)                     │
│                                                              │
│  Table: users                                               │
│  ├── id (SERIAL PRIMARY KEY)                                │
│  ├── full_name (VARCHAR)                                    │
│  ├── email (VARCHAR UNIQUE)                                 │
│  ├── password_hash (VARCHAR) ← 10 salt rounds bcrypt       │
│  └── created_at (TIMESTAMP)                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Layers

### Layer 1: Password Hashing (bcryptjs)
```
User Input: "MyPassword123"
    ↓
bcrypt.genSalt(10)           ← Generate random salt
    ↓
bcrypt.hash(password, salt)  ← Create hash
    ↓
Stored in DB: "$2a$10$xyz...def"  ← NOT plaintext!
```

### Layer 2: SQL Injection Prevention
```
❌ UNSAFE:
  `SELECT * FROM users WHERE email = '${email}'`
  
✅ SAFE (Parameterized Query):
  `SELECT * FROM users WHERE email = $1`
  pool.query(query, [email])  ← Values passed separately
```

### Layer 3: JWT Token Security
```
User Credentials Valid
    ↓
jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
    ↓
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ↓
Stored in localStorage (frontend)
    ↓
Sent in Authorization header: "Bearer token"
    ↓
Verified with JWT_SECRET on protected routes
```

### Layer 4: Request Validation
```
User submits data
    ↓
Check required fields (email, password, full_name)
    ↓
Validate email format
    ↓
Check email not already registered
    ↓
Check password length (min 6 chars recommended)
```

---

## 📁 File Structure with Purposes

```
Digipass/
│
├── server.js
│   └── Entry point, express app, routes mounting, error handling
│
├── db.js
│   └── PostgreSQL connection pool (pg module)
│
├── package.json
│   └── Dependencies: express, pg, bcryptjs, jsonwebtoken, cors
│
├── .env
│   └── PORT=3000, JWT_SECRET=..., CORS_ORIGIN=...
│
├── routes/
│   └── authRoutes.js
│       ├── POST /register (public)
│       ├── POST /login (public)
│       └── GET /me (protected)
│
├── controllers/
│   └── authController.js
│       ├── register()      - Validate, hash pwd, insert user
│       ├── login()         - Verify credentials, return token
│       └── getCurrentUser()- Return user info from DB
│
├── middleware/
│   └── auth.js
│       └── authenticateToken() - Extract & verify JWT token
│
├── utils/
│   ├── jwt.js
│   │   ├── generateToken()  - Create signed JWT
│   │   └── verifyToken()    - Decode & validate JWT
│   │
│   └── bcrypt.js
│       ├── hashPassword()   - Hash password with salt
│       └── comparePassword()- Verify password against hash
│
└── frontend/
    ├── register.html       - Registration form
    ├── login.html          - Login form
    ├── dashboard.html      - User dashboard (protected)
    ├── js/
    │   ├── register.js     - Handle registration form
    │   ├── login.js        - Handle login form
    │   ├── dashboard.js    - Dashboard navigation
    │   └── utils.js        - API calls with token
    └── css/
        ├── auth.css        - Auth page styling
        └── dashboard.css   - Dashboard styling
```

---

## 🔄 Request Flows

### Flow 1: User Registration

```
1. User fills register form, clicks "Register"
   ↓
2. frontend/js/register.js validates input
   ↓
3. POST /api/auth/register with JSON body
   ↓
4. server.js routes to authRoutes
   ↓
5. authRoutes.js calls authController.register()
   ↓
6. Controller validates (required fields, unique email)
   ↓
7. bcrypt.hashPassword() creates password hash
   ↓
8. Parameterized INSERT query → Database
   ↓
9. jwt.generateToken(userId) creates JWT
   ↓
10. Response with{ userId, fullName, email, token }
   ↓
11. Frontend saves token to localStorage
   ↓
12. Redirect to dashboard.html
```

### Flow 2: User Login

```
1. User fills login form, clicks "Login"
   ↓
2. frontend/js/login.js validates (email & password)
   ↓
3. POST /api/auth/login with JSON body
   ↓
4. authController.login() retrieves user by email
   ↓
5. bcrypt.comparePassword(input, hash) verifies
   ↓
6. If valid: jwt.generateToken() creates token
   ↓
7. Response with token (login successful)
   ↓
8. If invalid: Return 401 error
   ↓
9. Frontend saves token to localStorage
   ↓
10. Redirect to dashboard.html
```

### Flow 3: Protected Route Access (GET /api/auth/me)

```
1. Dashboard calls GET /api/auth/me
   ↓
2. frontend/js/utils.js adds header:
   Authorization: Bearer <token_from_localStorage>
   ↓
3. Express receives request
   ↓
4. auth.js middleware (authenticateToken) runs:
   - Extract token from header
   - jwt.verifyToken(token) checks signature & expiry
   ↓
5. If valid: req.userId set, next() continues
   ↓
6. authController.getCurrentUser() runs
   ↓
7. Queries DB: SELECT id, full_name, email FROM users
   ↓
8. Returns user data
   ↓
9. If token invalid/expired: Return 403 error
```

---

## 🧪 Endpoint Test Matrix

| Endpoint | Method | Auth | Body | Expected |
|----------|--------|------|------|----------|
| /api/auth/register | POST | No | {full_name, email, password} | 201, token |
| /api/auth/login | POST | No | {email, password} | 200, token |
| /api/auth/me | GET | Yes | - | 200, user data |
| /api/health | GET | No | - | 200, status |

---

## 🔑 Key Variables

| Variable | Location | Purpose | Example |
|----------|----------|---------|---------|
| JWT_SECRET | .env | Sign tokens | "my-secret-key" |
| token | localStorage | Store JWT | "eyJhbGc..." |
| userId | req body | Token payload | 1, 2, 3... |
| password_hash | DB | Store hashed pwd | "$2a$10$..." |
| SALT_ROUNDS | bcrypt.js | Hash iterations | 10 |
| expiresIn | jwt.js | Token lifetime | "7d" |

---

## ✅ Validation Points

### Registration Validation
- ✅ full_name: required, non-empty
- ✅ email: required, unique, valid format
- ✅ password: required, min 6 chars recommended

### Login Validation
- ✅ email: required, must exist in DB
- ✅ password: required, must match hash
- ✅ Both fields required

### Protected Route Validation
- ✅ Token required in Authorization header
- ✅ Token format: "Bearer <token>"
- ✅ Token signature valid
- ✅ Token not expired (7 days)

---

## 🚀 Quick Test

### Terminal 1: Start Backend
```bash
cd c:\Users\Abhinav\Desktop\Digipass
npm install
npm start
# Output: ✅ DIGIPASS API running on port 3000
```

### Terminal 2: Test with curl

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User","email":"test@ex.com","password":"123456"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ex.com","password":"123456"}'
```

**Get User (replace TOKEN with actual token):**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

---

## 📚 Module Dependencies

```javascript
// authController.js
const pool = require('../db');                          // DB connection
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateToken } = require('../utils/jwt');

// authRoutes.js
const { authenticateToken } = require('../middleware/auth');

// auth.js (middleware)
const { verifyToken } = require('../utils/jwt');

// server.js
const authRoutes = require('./routes/authRoutes');
```

---

## 🎯 Complete Authentication Ready!

✅ **Register** - bcrypt password hashing, unique email validation
✅ **Login** - Password verification, JWT generation
✅ **Protected Routes** - Token validation middleware
✅ **Security** - No plaintext passwords, SQL injection protection
✅ **Testing** - Postman collection included

**Everything is production-ready for further module development!** 🚀
