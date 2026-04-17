# Testing Guide: Grant Access & Async Email Features

## Complete Testing Workflow

### Phase 1: Backend Testing (Postman or cURL)

#### Step 1.1: Get User Token
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "yourpassword"
  }'

# Response:
# {
#   "success": true,
#   "data": {
#     "token": "eyJhbGciOiJIUzI1NiIs...",
#     "user": {...}
#   }
# }

# Save token
export TOKEN="eyJhbGciOiJIUzI1NiIs..."
```

#### Step 1.2: Add Executor (Test Non-blocking Email)
```bash
curl -X POST http://localhost:8080/api/executors \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "executor_name": "Test Executor",
    "executor_email": "testexecutor@example.com",
    "executor_phone": "+91 98765 43210",
    "relationship": "Friend"
  }'

# Check response time (should be < 100ms with async email)
# Response:
# {
#   "success": true,
#   "message": "Executor added successfully. Verification email will be sent shortly.",
#   "data": {
#     "executor_id": 5,
#     "executor_name": "Test Executor",
#     "verification_email_sent": "pending",
#     "verification_preview_url": "http://localhost:8080/executor-register.html?token=..."
#   }
# }

# Save executor_id
export EXECUTOR_ID="5"
```

**✓ Verify:** Response came back immediately (API not blocked by email)

#### Step 1.3: Complete Executor Registration
```bash
# Get token from verification_preview_url or from the email (in dev mode)
export VERIFICATION_TOKEN="token_from_email_or_preview_url"

curl -X POST http://localhost:8080/api/executor/register \
  -H "Content-Type: application/json" \
  -d '{
    "token": "'$VERIFICATION_TOKEN'",
    "password": "ExecutorPassword123",
    "confirm_password": "ExecutorPassword123"
  }'

# Response:
# {
#   "success": true,
#   "message": "Executor registered successfully. Access will be available once it is granted.",
#   "data": {
#     "executor_id": 5,
#     "executor_name": "Test Executor",
#     "executor_email": "testexecutor@example.com"
#   }
# }
```

**✓ Verify:** Registration succeeds, message says "Access will be available once it is granted"

#### Step 1.4: Test Executor Cannot Login Yet
```bash
curl -X POST http://localhost:8080/api/executor/login \
  -H "Content-Type: application/json" \
  -d '{
    "executor_email": "testexecutor@example.com",
    "password": "ExecutorPassword123"
  }'

# Expected error response (403):
# {
#   "success": false,
#   "message": "Executor is verified, but access has not been granted yet"
# }
```

**✓ Verify:** Login rejected with correct message about access not granted

#### Step 1.5: Grant Access (NEW ENDPOINT)
```bash
curl -X PATCH http://localhost:8080/api/executors/$EXECUTOR_ID/grant-access \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Response (200):
# {
#   "success": true,
#   "message": "Access granted to executor",
#   "data": {
#     "executor_id": 5,
#     "executor_name": "Test Executor",
#     "executor_email": "testexecutor@example.com",
#     "verification_status": "verified",
#     "access_granted": true
#   }
# }
```

**✓ Verify:** Response shows `access_granted: true`

#### Step 1.6: Test Executor Can Now Login
```bash
curl -X POST http://localhost:8080/api/executor/login \
  -H "Content-Type: application/json" \
  -d '{
    "executor_email": "testexecutor@example.com",
    "password": "ExecutorPassword123"
  }'

# Success response (200):
# {
#   "success": true,
#   "message": "Executor login successful",
#   "data": {
#     "token": "eyJhbGciOiJIUzI1NiIs...",
#     "executor": {...}
#   }
# }
```

**✓ Verify:** Login now succeeds! Executor can access portal.

#### Step 1.7: Revoke Access (NEW ENDPOINT)
```bash
curl -X PATCH http://localhost:8080/api/executors/$EXECUTOR_ID/revoke-access \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Response (200):
# {
#   "success": true,
#   "message": "Access revoked from executor",
#   "data": {
#     "executor_id": 5,
#     "executor_name": "Test Executor",
#     "verification_status": "verified",
#     "access_granted": false
#   }
# }
```

**✓ Verify:** Response shows `access_granted: false`

#### Step 1.8: Test Executor Cannot Login Again
```bash
curl -X POST http://localhost:8080/api/executor/login \
  -H "Content-Type: application/json" \
  -d '{
    "executor_email": "testexecutor@example.com",
    "password": "ExecutorPassword123"
  }'

# Expected error response (403):
# {
#   "success": false,
#   "message": "Executor is verified, but access has not been granted yet"
# }
```

**✓ Verify:** Login blocked again after revocation

---

### Phase 2: Frontend Testing (Browser)

#### Step 2.1: Login as Owner
1. Open http://localhost:8080/login.html
2. Log in with valid credentials
3. Verify dashboard loads

**✓ Expected:** Dashboard visible, user info shown

#### Step 2.2: Navigate to Executors Page
1. Click "Executors" in navigation menu
2. Verify executor list loads

**✓ Expected:** Executor from Step 1.2 visible in list

#### Step 2.3: Check Status Badge and Live Status
1. Look at executor card for the test executor
2. Verify status badge shows "Invited" (yellow)
3. Wait a moment, refresh page
4. After executor completes registration, status should change to "Verified" (blue)

**✓ Expected:** 
- Initially shows "Invited" (yellow badge)
- After registration shows "Verified" (blue badge)
- Shows "Grant Access" button

#### Step 2.4: Test Grant Access Button
1. Find executor with "Verified" status
2. Click "Grant Access" button
3. Button shows "Granting..." state
4. Wait for completion

**✓ Expected:**
- Button changes to "Granting..."
- Success notification appears: "Access granted successfully!"
- Executor status changes to "Active" (green badge)
- Button changes to "✓ Access Granted" (disabled)
- "Revoke Access" button appears

#### Step 2.5: Test Revoke Access Button
1. Click "Revoke Access" button
2. Confirm in dialog
3. Button shows "Revoking..." state

**✓ Expected:**
- Confirmation dialog appears
- Button shows "Revoking..."
- Success notification: "Access revoked successfully!"
- Status changes back to "Verified" (blue badge)
- "Grant Access" button appears again
- "Revoke Access" button disappears

#### Step 2.6: Test Multiple Toggle
1. Click "Grant Access" again
2. Then "Revoke Access"  
3. Then "Grant Access" one more time

**✓ Expected:** All state transitions work smoothly without page refresh

---

### Phase 3: Email Sending Testing

#### Step 3.1: Check Backend Logs
When adding executor, look for logs:
```
[Executor Controller] addExecutor called
[Executor Controller] Executor created in database
[Executor Controller] Queuing email to send in background...
[Response sent to client immediately]
[Executor Controller] [Background] Calling sendExecutorVerificationEmail...
[Executor Controller] [Background] Email sent successfully
```

**✓ Verify:**
- Response sent before "Email sent successfully" log
- No blocking between request and response

#### Step 3.2: Test SMTP Failure Handling
1. Stop SMTP server or use invalid SMTP credentials
2. Add a new executor
3. Check API response (should still succeed)
4. Check logs for email error

**✓ Expected:**
- API returns 201 success immediately
- Logs show email error in background
- No error response sent to client
- User can still resend verification manually

---

### Phase 4: Database Verification

#### Step 4.1: Check Executor Status in Database
```sql
SELECT 
  executor_id,
  executor_name,
  verification_status,
  access_granted,
  updated_at
FROM executors
WHERE executor_id = 5;
```

**Expected Results:**
```
executor_id | executor_name   | verification_status | access_granted | updated_at
     5      | Test Executor   |     verified        |      true      | 2026-04-15T...
```

#### Step 4.2: Verify Grant/Revoke Updates `updated_at`
1. Note current `updated_at` timestamp
2. Run grant access
3. Check database again

**✓ Expected:** `updated_at` timestamp changed to current time

---

### Phase 5: Edge Case Testing

#### Test 5.1: Cannot Grant Access to Unverified Executor
```bash
# Create a new executor (not yet verified)
curl -X POST http://localhost:8080/api/executors \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "executor_name": "Unverified Executor",
    "executor_email": "unverified@example.com"
  }'

# Try to grant access to unverified executor
export NEW_EXECUTOR_ID="6"
curl -X PATCH http://localhost:8080/api/executors/$NEW_EXECUTOR_ID/grant-access \
  -H "Authorization: Bearer $TOKEN"

# Expected error (400):
# {
#   "success": false,
#   "message": "Executor must be verified before granting access"
# }
```

**✓ Verify:** Correctly rejects unverified executors

#### Test 5.2: Cannot Grant Twice
```bash
# Try to grant access again to already granted executor
curl -X PATCH http://localhost:8080/api/executors/5/grant-access \
  -H "Authorization: Bearer $TOKEN"

# Expected error (400):
# {
#   "success": false,
#   "message": "Access is already granted to this executor"
# }
```

**✓ Verify:** Prevents duplicate grants

#### Test 5.3: Cannot Revoke Twice
```bash
# Revoke access
curl -X PATCH http://localhost:8080/api/executors/5/revoke-access \
  -H "Authorization: Bearer $TOKEN"

# Try to revoke again
curl -X PATCH http://localhost:8080/api/executors/5/revoke-access \
  -H "Authorization: Bearer $TOKEN"

# Expected error (400):
# {
#   "success": false,
#   "message": "Access is not currently granted to this executor"
# }
```

**✓ Verify:** Prevents double revocation

#### Test 5.4: Cannot Grant Access to Someone Else's Executor
```bash
# Login as different user and get their token
export DIFFERENT_USER_TOKEN="token_of_different_user"

# Try to grant access to first user's executor
curl -X PATCH http://localhost:8080/api/executors/5/grant-access \
  -H "Authorization: Bearer $DIFFERENT_USER_TOKEN"

# Expected error (404):
# {
#   "success": false,
#   "message": "Executor not found"
# }
```

**✓ Verify:** Authorization check prevents access to other users' executors

#### Test 5.5: Invalid Executor ID
```bash
curl -X PATCH http://localhost:8080/api/executors/invalid/grant-access \
  -H "Authorization: Bearer $TOKEN"

# Expected error (400):
# {
#   "success": false,
#   "message": "A valid executor id is required"
# }
```

**✓ Verify:** Validates executor ID format

---

### Phase 6: Performance Testing

#### Test 6.1: Measure API Response Time
```bash
# Time the executor addition
time curl -X POST http://localhost:8080/api/executors \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "executor_name": "Performance Test",
    "executor_email": "perf@example.com"
  }'

# Expected: real    0m0.050s (< 100ms)
#           user    0m0.020s
#           sys     0m0.030s
```

**✓ Verify:** API responds in < 100ms (not waiting for SMTP)

#### Test 6.2: Grant Access Performance
```bash
# Time grant access
time curl -X PATCH http://localhost:8080/api/executors/5/grant-access \
  -H "Authorization: Bearer $TOKEN"

# Expected: real    0m0.030s (< 50ms)
```

**✓ Verify:** Database-only operation is very fast

---

## Test Results Checklist

### Backend Tests
- [ ] Add executor returns immediately (< 100ms)
- [ ] Email sent in background without blocking
- [ ] Executor registration succeeds
- [ ] Login blocked before access granted
- [ ] Grant access succeeds, access_granted = true
- [ ] Executor login succeeds after grant
- [ ] Revoke access succeeds, access_granted = false  
- [ ] Executor login blocked after revoke

### Frontend Tests
- [ ] Executor list loads
- [ ] Status badges show correct colors (Invited/Verified/Active)
- [ ] Grant Access button visible when status = Verified
- [ ] Revoke Access button visible when status = Active
- [ ] Button state changes during operation
- [ ] Status updates immediately after API response
- [ ] Success notifications appear
- [ ] Executor list re-renders correctly

### Database Tests
- [ ] verification_status = 'verified' after registration
- [ ] access_granted = false initially
- [ ] access_granted = true after grant
- [ ] updated_at timestamp changes on grant/revoke

### Edge Cases
- [ ] Cannot grant to unverified executor
- [ ] Cannot grant twice
- [ ] Cannot revoke twice
- [ ] Cannot access other user's executors
- [ ] Invalid executor ID rejected

### Performance
- [ ] Add executor < 100ms
- [ ] Grant access < 50ms
- [ ] Revoke access < 50ms

---

## Debugging Tips

### If Async Email Not Working

**Check server logs for:**
```
[Executor Controller] Queuing email to send in background...
[Executor Controller] [Background] Calling sendExecutorVerificationEmail...
```

If not present, email might not be running async. Check that `setImmediate()` is being used.

### If Grant Access Button Doesn't Appear

**Check:**
1. Is `verification_status` really 'verified'?
   ```sql
   SELECT verification_status FROM executors WHERE executor_id = 5;
   ```
2. Is `access_granted` false?
   ```sql
   SELECT access_granted FROM executors WHERE executor_id = 5;
   ```
3. Check browser console for JavaScript errors
4. Check network tab to see if API calls are working

### If Status Badge Wrong Color

**Check CSS classes in browser DevTools:**
1. Right-click executor card
2. Inspect element
3. Look for `executor-status-badge` classes
4. Should have one of: `status-invited`, `status-verified`, `status-active`

### If Email Not Being Sent

**Check SMTP configuration:**
```bash
echo $SMTP_HOST
echo $SMTP_PORT
echo $SMTP_USER
```

**Check logs:**
```bash
npm install nodemailer-mock # For testing
```

---

## Final Sign-Off

Once all tests pass:
- ✅ Feature is production-ready
- ✅ No database migrations needed  
- ✅ No breaking changes
- ✅ Backward compatible

You're done! 🎉
