# 🔐 DIGIPASS Authentication - Complete Implementation

## ✅ Implementation Checklist

### Backend Code Structure
- ✅ `utils/jwt.js` - Token generation with 7-day expiration
- ✅ `utils/bcrypt.js` - Password hashing with 10 salt rounds
- ✅ `middleware/auth.js` - Token verification middleware
- ✅ `controllers/authController.js` - Register, Login, Get User logic
- ✅ `routes/authRoutes.js` - Public & protected route definitions
- ✅ `server.js` - Express app with routes mounted

### Security Features
- ✅ **Parameterized Queries** - Using `$1, $2, $3` to prevent SQL injection
- ✅ **Password Hashing** - bcryptjs with 10 salt rounds (not plaintext)
- ✅ **JWT Tokens** - Signed with secret, 7-day expiration
- ✅ **Protected Routes** - Middleware validates token before access
- ✅ **CORS** - Enabled for frontend communication
- ✅ **Error Handling** - Proper messages without exposing sensitive data

---

## 📡 API Endpoints

### 1️⃣ POST /api/auth/register
**Description:** Create new user account

**Request:**
```json
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (Success - 201):**
```json
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

**Response (Error - 409):**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Full name, email, and password are required"
}
```

---

### 2️⃣ POST /api/auth/login
**Description:** User login and get JWT token

**Request:**
```json
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": 1,
    "fullName": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### 3️⃣ GET /api/auth/me
**Description:** Get current user info (requires valid token)

**Request:**
```
GET http://localhost:3000/api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "fullName": "John Doe",
    "email": "john@example.com"
  }
}
```

**Response (Error - 401 - No Token):**
```json
{
  "success": false,
  "message": "No token provided. Please login."
}
```

**Response (Error - 403 - Invalid Token):**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

## 🧪 Testing with Postman

### Setup Postman Environment Variable

1. **Create Environment Variable for Token**
   - In Postman, go to: Environments → Create New
   - Add variable: `token` with empty value
   - Save as: `DIGIPASS`

### Test 1: Register User

```
Method: POST
URL: http://localhost:3000/api/auth/register

Body (raw, JSON):
{
  "full_name": "Alice Smith",
  "email": "alice@example.com",
  "password": "Alice@123456"
}
```

**Expected Response:** 201 Created with token

**Save Token:**
```javascript
var jsonData = pm.response.json();
pm.environment.set("token", jsonData.data.token);
```

---

### Test 2: Login User

```
Method: POST
URL: http://localhost:3000/api/auth/login

Body (raw, JSON):
{
  "email": "alice@example.com",
  "password": "Alice@123456"
}
```

**Expected Response:** 200 OK with token

**Save Token:**
```javascript
var jsonData = pm.response.json();
pm.environment.set("token", jsonData.data.token);
```

---

### Test 3: Get Current User (Protected)

```
Method: GET
URL: http://localhost:3000/api/auth/me

Headers:
Authorization: Bearer {{token}}
```

**Expected Response:** 200 OK with user data

---

### Test 4: Invalid Token

```
Method: GET
URL: http://localhost:3000/api/auth/me

Headers:
Authorization: Bearer invalid_token_here
```

**Expected Response:** 403 Forbidden

---

## 🔑 Code Walkthrough

### How Password is Secured (Register Flow)

```javascript
// 1. User submits plaintext password
const { full_name, email, password } = req.body;

// 2. Hash it with bcrypt (10 salt rounds)
const password_hash = await hashPassword(password);
// password_hash = "$2a$10$abc123xyz..."

// 3. Store ONLY the hash in database
await pool.query(
  'INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3)',
  [full_name, email, password_hash]  // password_hash, not password!
);
```

### How Login is Verified

```javascript
// 1. User submits login email + password
const { email, password } = req.body;

// 2. Find user by email from database
const user = await pool.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);

// 3. Compare plaintext password with stored hash
const isValid = await comparePassword(password, user.password_hash);

// 4. If valid, generate JWT token
if (isValid) {
  const token = generateToken(user.id);
  // Send token to frontend
}
```

### How Protected Routes Work

```javascript
// Middleware runs for protected routes
const authenticateToken = (req, res, next) => {
  // 1. Extract token from "Authorization: Bearer token"
  const token = authHeader.split(' ')[1];

  // 2. Verify token with JWT_SECRET
  const decoded = jwt.verify(token, JWT_SECRET);

  // 3. If valid, attach userId to request
  req.userId = decoded.userId;
  next();

  // 4. If invalid, return 403 error
};

// Usage in routes
router.get('/me', authenticateToken, getCurrentUser);
//         ↑              ↑              ↑
//       path        middleware      controller
```

---

## 📊 Database Schema

```sql
-- Users table (already exists)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Queries used:
-- INSERT: INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3)
-- SELECT by email: SELECT * FROM users WHERE email = $1
-- UPDATE: Can be added later for profile updates
-- DELETE: Can be added later for account deletion
```

---

## 🚀 Running the Server

### Prerequisites
- PostgreSQL running on localhost:5432
- Database "Digipass" created
- Table "users" with columns: id, full_name, email, password_hash

### Start Backend
```bash
cd c:\Users\Abhinav\Desktop\Digipass
npm install              # First time only
npm start                # Start server on port 3000
```

**Expected Output:**
```
✅ DIGIPASS API running on port 3000
Available endpoints:
  - POST   /api/auth/register (public)
  - POST   /api/auth/login (public)
  - GET    /api/auth/me (protected)
  - GET    /api/health (public)
```

---

## ✨ Features

| Feature | Implementation | Status |
|---------|----------------|----|
| User Registration | bcrypt + parameterized query | ✅ |
| Secure Login | Password comparison + JWT | ✅ |
| Token Generation | 7-day expiration | ✅ |
| Protected Routes | Middleware validation | ✅ |
| CORS Support | Frontend communication | ✅ |
| Error Handling | Proper status codes | ✅ |
| Input Validation | Email, password, name | ✅ |
| SQL Injection Protection | Parameterized queries | ✅ |

---

## 🆘 Troubleshooting

### "Cannot find module 'bcryptjs'"
```bash
npm install bcryptjs
```

### "Cannot find module 'jsonwebtoken'"
```bash
npm install jsonwebtoken
```

### "Cannot connect to database"
- Check PostgreSQL is running
- Verify db.js credentials match your setup
- Ensure "Digipass" database exists

### "Email already registered"
- Use a different email for testing
- Or clear users table: `DELETE FROM users;`

### "Invalid email or password"
- Double check email and password
- Passwords are case-sensitive
- Token may be expired (7 days)

---

## 📋 Summary

✅ **Registration:** Hashes password, stores user, returns JWT token
✅ **Login:** Verifies password, generates JWT token
✅ **Protected Route:** Validates token, returns user data
✅ **Security:** No plaintext passwords, parameterized queries, signed tokens

**Everything is ready for testing!** 🎉
