# 🧪 COMPLETE AUTHENTICATION TESTING - STEP-BY-STEP

## ✅ Ready to Test? Here's Everything You Need

---

## 📋 Prerequisites

Before testing, make sure:
- ✅ PostgreSQL is running on localhost:5432
- ✅ Database "Digipass" exists
- ✅ Users table is created
- ✅ Node.js is installed
- ✅ npm install has been run

---

## 🚀 STEP 1: Start the Server

### In Terminal/PowerShell:

```powershell
cd c:\Users\Abhinav\Desktop\Digipass
npm install
npm start
```

### Expected Output:

```
✅ DIGIPASS API running on port 3000
Available endpoints:
  - POST   /api/auth/register (public)
  - POST   /api/auth/login (public)
  - GET    /api/auth/me (protected)
  - GET    /api/auth/dashboard-test (protected)
  - GET    /api/health (public)
```

If you see this ✅ - **Server is ready!**

---

## 🧪 TESTING METHOD CHOICE

Pick ONE method:
- **Method A:** Postman (Easiest)
- **Method B:** curl commands (Testing)
- **Method C:** PowerShell script (Automated)

---

## 🅰️ METHOD A: POSTMAN (RECOMMENDED)

### Setup (First time only)

1. **Open Postman**
2. **Create new collection** called "DIGIPASS Auth"
3. **Create environment** called "DIGIPASS" with variables:
   - `token` = (leave empty)
   - `userId` = (leave empty)

### Test Sequence

#### 📌 Request 1: HEALTH CHECK

```
Method:  GET
URL:     http://localhost:3000/api/health
Headers: (none)
Body:    (empty)
```

**Click "Send"**

Expected Response:
```json
{
  "success": true,
  "message": "DIGIPASS API Running",
  "timestamp": "2025-04-12T10:30:15.123Z"
}
```

✅ **Status: 200 OK** → Server running!

---

#### 📌 Request 2: REGISTER USER

```
Method:  POST
URL:     http://localhost:3000/api/auth/register
Headers: Content-Type: application/json
Body:    (raw JSON)
```

**Body to paste:**
```json
{
  "full_name": "John Doe",
  "email": "john.doe@test.com",
  "password": "JohnPassword123"
}
```

**Click "Send"**

Expected Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": 1,
    "fullName": "John Doe",
    "email": "john.doe@test.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc0NDUwNzg0NSwiZXhwIjoxNzQ1MTEyNjQ1fQ..."
  }
}
```

✅ **Status: 201 Created** → User registered!

**💡 IMPORTANT: Save the token!**

Click on the "Tests" tab and paste:
```javascript
var jsonData = pm.response.json();
pm.environment.set("token", jsonData.data.token);
pm.environment.set("userId", jsonData.data.userId);
```

Then click "Send" again to save token to environment.

---

#### 📌 Request 3: LOGIN USER

```
Method:  POST
URL:     http://localhost:3000/api/auth/login
Headers: Content-Type: application/json
Body:    (raw JSON)
```

**Body to paste:**
```json
{
  "email": "john.doe@test.com",
  "password": "JohnPassword123"
}
```

**Click "Send"**

Expected Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": 1,
    "fullName": "John Doe",
    "email": "john.doe@test.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

✅ **Status: 200 OK** → Login successful!

**Save token (same as Request 2):**
Click Tests tab, paste the code, click Send.

---

#### 📌 Request 4: GET USER (Protected - With Token)

```
Method:  GET
URL:     http://localhost:3000/api/auth/me
Headers: Authorization: Bearer {{token}}
Body:    (empty)
```

**Important:** Use the {{token}} variable from Postman environment

**Click "Send"**

Expected Response:
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "fullName": "John Doe",
    "email": "john.doe@test.com"
  }
}
```

✅ **Status: 200 OK** → Protected route works!

---

#### 📌 Request 5: DASHBOARD TEST (Protected - With Token)

```
Method:  GET
URL:     http://localhost:3000/api/auth/dashboard-test
Headers: Authorization: Bearer {{token}}
Body:    (empty)
```

**Click "Send"**

Expected Response:
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

✅ **Status: 200 OK** → Dashboard test passed!

---

#### 📌 Request 6: NO TOKEN TEST (Should Fail)

```
Method:  GET
URL:     http://localhost:3000/api/auth/me
Headers: (NONE - no Authorization header!)
Body:    (empty)
```

**Click "Send"**

Expected Response:
```json
{
  "success": false,
  "message": "No token provided. Please login."
}
```

❌ **Status: 401 Unauthorized** → Correctly rejected!

---

#### 📌 Request 7: INVALID TOKEN TEST (Should Fail)

```
Method:  GET
URL:     http://localhost:3000/api/auth/me
Headers: Authorization: Bearer invalid_token_xyz
Body:    (empty)
```

**Click "Send"**

Expected Response:
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

❌ **Status: 403 Forbidden** → Correctly rejected!

---

## 🅱️ METHOD B: CURL COMMANDS

Open PowerShell and run these commands one by one:

### Test 1: Health Check
```powershell
curl http://localhost:3000/api/health
```

### Test 2: Register
```powershell
$body = @{
    full_name = "Alice Smith"
    email = "alice@test.com"
    password = "AlicePass123"
} | ConvertTo-Json

curl -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -Body $body
```

**Copy the token from response!** You'll need it for the next tests.

### Test 3: Login
```powershell
$body = @{
    email = "alice@test.com"
    password = "AlicePass123"
} | ConvertTo-Json

curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -Body $body
```

### Test 4: Get User (With Token)
```powershell
# Replace YOUR_TOKEN_FROM_ABOVE with actual token
$token = "YOUR_TOKEN_FROM_ABOVE"

curl -X GET http://localhost:3000/api/auth/me `
  -H "Authorization: Bearer $token"
```

### Test 5: Dashboard Test (With Token)
```powershell
$token = "YOUR_TOKEN_FROM_ABOVE"

curl -X GET http://localhost:3000/api/auth/dashboard-test `
  -H "Authorization: Bearer $token"
```

### Test 6: No Token (Should Fail)
```powershell
curl -X GET http://localhost:3000/api/auth/me
```

Expected: 401 error

### Test 7: Invalid Token (Should Fail)
```powershell
curl -X GET http://localhost:3000/api/auth/me `
  -H "Authorization: Bearer wrong_token"
```

Expected: 403 error

---

## 🅲️ METHOD C: AUTOMATED POWERSHELL SCRIPT

### Run the script:

```powershell
cd c:\Users\Abhinav\Desktop\Digipass

# Allow script execution (first time only)
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser

# Run the automated tests
.\Test-Authentication.ps1
```

The script will:
- ✅ Automatically create a test user
- ✅ Register, login, and get token
- ✅ Access protected routes
- ✅ Test error cases
- ✅ Show a summary of all tests

Expected Output: All 7 tests PASSED ✅

---

## 📊 TESTING CHECKLIST

Mark as complete:

- [ ] Server starts without errors
- [ ] Health check returns 200 OK
- [ ] Register user returns 201 + token
- [ ] Login returns 200 + token
- [ ] Get /me with token returns 200 + user data
- [ ] Dashboard test with token returns 200
- [ ] /me without token returns 401
- [ ] /me with bad token returns 403
- [ ] All 7 tests passed! ✅

---

## 🔍 DATABASE VERIFICATION

After testing, verify user was created:

### Option 1: Using psql
```sql
-- Connect to PostgreSQL
psql -U postgres -d Digipass

-- Check users table
SELECT id, full_name, email, created_at FROM users;

-- You should see your test users!
-- Example output:
-- id |  full_name  |          email           |         created_at
-- ───┼─────────────┼──────────────────────────┼──────────────────────
--  1 | John Doe    | john.doe@test.com        | 2025-04-12 10:30:15
--  2 | Alice Smith | alice@test.com           | 2025-04-12 10:32:00
```

### Option 2: Check via API
After login, the response shows you the stored user data - so if you got it, it's in the database!

---

## ✨ VERIFICATION COMPLETE!

If all tests pass, you have:

✅ User registration working (password hashing, validation)
✅ User login working (password verification, JWT generation)
✅ Protected routes working (token validation middleware)
✅ Error handling working (proper 401/403 responses)
✅ Database integration working (users table populated)

---

## 🎯 What Each Test Proves

| Test | What It Proves |
|------|---|
| Health | Server is running |
| Register | Password hashing + database insert works |
| Login | Password verification + JWT generation |
| Get /me | Protected routes work with token |
| Dashboard | Another protected route works |
| No Token | Properly rejects missing auth |
| Bad Token | Properly rejects invalid tokens |

---

## 🚀 NEXT STEP

When all 7 tests pass ✅:
- Authentication is PRODUCTION READY
- Ready to build Module 2: Digital Assets Management
- Ready to build Module 3: Executor System
- Ready to build Module 4: Digital Will Generator
- Ready to build Module 5: Dead Man's Switch

---

## 💡 Quick Tips

1. **Save Token in Postman:**
   - Click "Tests" tab after register/login
   - Paste the auto-save script
   - Token auto-fills in {{token}} variable

2. **Use Different Emails:**
   - Each test user needs unique email
   - Or clear database: `DELETE FROM users;`

3. **Token Expires in 7 Days:**
   - If you get 403 after a week of testing
   - Just login again to get fresh token

4. **Check All Endpoints:**
   - Don't skip the error tests (6 & 7)
   - They prove security is working!

---

## 🎉 EVERYTHING READY FOR TESTING!

Pick your method (Postman, curl, or script) and start testing!

Let me know the results when you're done! 🚀
