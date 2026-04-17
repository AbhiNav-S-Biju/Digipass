# 🧪 DIGIPASS Authentication - Complete Testing Guide

## ✅ Protected Routes Added

```
✅ POST   /api/auth/register      (Public)
✅ POST   /api/auth/login         (Public)
✅ GET    /api/auth/me            (Protected)
✅ GET    /api/auth/dashboard-test (Protected) ← NEW!
✅ GET    /api/health             (Public)
```

---

## 🚀 Quick Start - Step by Step

### Step 1: Start the Server

**Terminal 1:**
```powershell
cd c:\Users\Abhinav\Desktop\Digipass
npm install
npm start
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

## 🧪 Method 1: Test with Postman

### Setup Postman

1. **Download Postman** (if not already installed)
   - https://www.postman.com/downloads/

2. **Import Collection** (OPTIONAL - makes testing easier)
   - Open Postman
   - Click "Import" (top left)
   - Choose file: `DIGIPASS_Auth_Collection.json`
   - This provides pre-built requests

3. **Create Environment Variables** (RECOMMENDED)
   - Click "Environments" (left sidebar)
   - Click "Create New"
   - Add variables:
     ```
     token     = (leave empty, will be auto-filled)
     userId    = (leave empty, will be auto-filled)
     ```
   - Name: `DIGIPASS`
   - Save and select this environment (top right)

---

### Test 1️⃣: Health Check (Verify Server Running)

```
Method: GET
URL: http://localhost:3000/api/health
Headers: (none needed)
Body: (none)
```

**Expected Response:**
```json
{
  "success": true,
  "message": "DIGIPASS API Running",
  "timestamp": "2025-04-12T10:30:45.123Z"
}
```

---

### Test 2️⃣: Register User

**Create a new request in Postman:**

```
Method: POST
URL: http://localhost:3000/api/auth/register

Headers:
  Content-Type: application/json

Body (raw JSON):
{
  "full_name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123"
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": 1,
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc0NDUwNzg0NSwiZXhwIjoxNzQ1MTEyNjQ1fQ..."
  }
}
```

**💡 IMPORTANT: Save the token!**
- In Postman, go to "Tests" tab
- Paste this code:
```javascript
var jsonData = pm.response.json();
pm.environment.set("token", jsonData.data.token);
pm.environment.set("userId", jsonData.data.userId);
console.log('✅ Token saved to environment!');
```
- Click "Send" and run the script

---

### Test 3️⃣: Login User

**Create a new request:**

```
Method: POST
URL: http://localhost:3000/api/auth/login

Headers:
  Content-Type: application/json

Body (raw JSON):
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": 1,
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**💡 Save the token (same as above):**
```javascript
var jsonData = pm.response.json();
pm.environment.set("token", jsonData.data.token);
pm.environment.set("userId", jsonData.data.userId);
console.log('✅ Token saved!');
```

---

### Test 4️⃣: Get Current User (Protected)

**Create a new request:**

```
Method: GET
URL: http://localhost:3000/api/auth/me

Headers:
  Authorization: Bearer {{token}}

Body: (none)
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "fullName": "John Doe",
    "email": "john.doe@example.com"
  }
}
```

---

### Test 5️⃣: Test Protected Route (Dashboard Test)

**Create a new request:**

```
Method: GET
URL: http://localhost:3000/api/auth/dashboard-test

Headers:
  Authorization: Bearer {{token}}

Body: (none)
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Protected route accessed successfully!",
  "userId": 1,
  "timestamp": "2025-04-12T10:35:22.456Z",
  "testData": {
    "dashboard": "This is a test protected endpoint",
    "authenticated": true
  }
}
```

---

### Test 6️⃣: Test with Invalid Token (Should Fail)

**Create a new request:**

```
Method: GET
URL: http://localhost:3000/api/auth/me

Headers:
  Authorization: Bearer invalid_token_xyz

Body: (none)
```

**Expected Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

### Test 7️⃣: Test without Token (Should Fail)

**Create a new request:**

```
Method: GET
URL: http://localhost:3000/api/auth/me

Headers: (none - NO Authorization header)

Body: (none)
```

**Expected Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "No token provided. Please login."
}
```

---

## 🖥️ Method 2: Test with curl (Command Line)

Open **PowerShell** and run these commands:

### Health Check
```powershell
curl -X GET http://localhost:3000/api/health
```

### Register User
```powershell
$body = @{
    full_name = "Jane Smith"
    email = "jane.smith@example.com"
    password = "JanePassword123"
} | ConvertTo-Json

curl -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -Body $body
```

**Copy the `token` from response** - you'll need it for next tests!

### Login User
```powershell
$body = @{
    email = "jane.smith@example.com"
    password = "JanePassword123"
} | ConvertTo-Json

curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -Body $body
```

### Get Current User (Protected)
```powershell
# Replace TOKEN with the actual token from login response
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:3000/api/auth/me `
  -H "Authorization: Bearer $token"
```

### Test Dashboard (Protected)
```powershell
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:3000/api/auth/dashboard-test `
  -H "Authorization: Bearer $token"
```

---

## 🖥️ Method 3: Simple One-Line Tests with curl

### Register (Linux/Mac/Git Bash)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Alice Johnson",
    "email": "alice@example.com",
    "password": "AlicePass123"
  }'
```

### Login (Get Token)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "AlicePass123"
  }'
```

### Test Protected Route
```bash
# Replace TOKEN with token from login
curl -X GET http://localhost:3000/api/auth/dashboard-test \
  -H "Authorization: Bearer TOKEN"
```

---

## 📊 Complete Test Sequence (Step-by-Step)

### Scenario: New User Registration → Login → Access Protected Route

**Step 1: Register new user**
```
POST /api/auth/register
Body: { full_name, email, password }
Response: 201 + token ✅
Action: Save token
```

**Step 2: Login with credentials**
```
POST /api/auth/login
Body: { email, password }
Response: 200 + token ✅
Action: Confirm token matches
```

**Step 3: Get user info (protected)**
```
GET /api/auth/me
Header: Authorization: Bearer TOKEN
Response: 200 + user data ✅
```

**Step 4: Test dashboard (protected)**
```
GET /api/auth/dashboard-test
Header: Authorization: Bearer TOKEN
Response: 200 + test data ✅
```

**Step 5: Try without token (should fail)**
```
GET /api/auth/me
Header: (none)
Response: 401 ✅
```

**Step 6: Try with invalid token (should fail)**
```
GET /api/auth/me
Header: Authorization: Bearer invalid
Response: 403 ✅
```

---

## ✅ Test Results Expected

| Test | Expected | Status |
|------|----------|--------|
| Health check | 200 + message | ✅ |
| Register user | 201 + token | ✅ |
| Login user | 200 + token | ✅ |
| Get user (with token) | 200 + user data | ✅ |
| Dashboard test (with token) | 200 + test data | ✅ |
| Get user (no token) | 401 error | ✅ |
| Dashboard test (invalid token) | 403 error | ✅ |

---

## 🔍 Troubleshooting

### "Cannot GET /api/auth/register"
**Problem:** Server not running  
**Solution:** Run `npm start` in terminal

### "Connection refused"
**Problem:** Server not listening on port 3000  
**Solution:** Check if port 3000 is in use: `netstat -ano | findstr :3000`

### "Invalid token"
**Problem:** Token copied incorrectly or expired  
**Solution:** Get a fresh token by logging in again

### "Email already registered"
**Problem:** Email already exists in database  
**Solution:** Use a different email: `user${Date.now()}@example.com`

### "Password must be at least 6 characters"
**Problem:** Password too short  
**Solution:** Use password with 6+ characters

### Database connection error
**Problem:** PostgreSQL not running  
**Solution:** 
- Windows: Start PostgreSQL service
- Check `db.js` credentials match your setup

---

## 📝 Sample Test Data

Use these for testing:

```
User 1:
  Name: John Doe
  Email: john.doe@example.com
  Password: SecurePass123

User 2:
  Name: Jane Smith
  Email: jane.smith@example.com
  Password: JanePass456

User 3:
  Name: Bob Johnson
  Email: bob.j@example.com
  Password: BobPassword789
```

---

## 🎯 Verification Checklist

After running all tests, verify:

- ✅ Server starts without errors
- ✅ Health check returns success
- ✅ Can register new user
- ✅ Can login and get JWT token
- ✅ Token saved to localStorage (frontend)
- ✅ Can access protected route with token
- ✅ Dashboard test route returns correct data
- ✅ Protected routes reject without token
- ✅ Protected routes reject invalid token
- ✅ Error messages are clear

---

## 📚 Important Headers

When using **protected routes**, always include:
```
Authorization: Bearer <JWT_TOKEN>
```

Without this header:
```
Response: 401 Unauthorized
Message: "No token provided. Please login."
```

---

## 🔑 Token Structure

JWT tokens follow this format:
```
Header.Payload.Signature

Example:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJ1c2VySWQiOjEsImlhdCI6MTc0NDUwNzg0NSwiZXhwIjoxNzQ1MTEyNjQ1fQ.
abc123def456...

Decoded Payload:
{
  "userId": 1,
  "iat": 1744507845,
  "exp": 1745112645
}
```

Token expires after **7 days** - then user must login again.

---

## ✨ Test Complete!

If all tests pass, authentication system is **working perfectly**! 🎉

---

### Next Steps After Testing:
1. ✅ Verify all 7 test scenarios pass
2. ✅ Check database has user records
3. ✅ Confirm tokens are being generated correctly
4. ✅ Build Module 2: Digital Assets Management
