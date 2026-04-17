# DIGIPASS Authentication Test Script

$BaseURL = "http://localhost:3000/api"
$Email = "testuser$(Get-Random)@example.com"
$Password = "TestPass123"
$Name = "Test User"

$passed = 0
$failed = 0

Write-Host ""
Write-Host "=========================================="
Write-Host "DIGIPASS AUTHENTICATION TEST"
Write-Host "=========================================="
Write-Host ""

# TEST 1: Health Check
Write-Host "[1/7] Health Check" -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "$BaseURL/health" -Method GET
    if ($result.success -eq $true) {
        Write-Host "  PASS: Server is running" -ForegroundColor Green
        $passed++
    }
} catch {
    Write-Host "  FAIL: $($_)" -ForegroundColor Red
    $failed++
}

# TEST 2: Register User
Write-Host "[2/7] Register User" -ForegroundColor Yellow
Write-Host "  Email: $Email"

try {
    $body = @{
        full_name = $Name
        email = $Email
        password = $Password
    } | ConvertTo-Json

    $reg = Invoke-RestMethod -Uri "$BaseURL/auth/register" -Method POST `
        -Headers @{"Content-Type" = "application/json"} -Body $body
    
    if ($reg.success -eq $true) {
        $regToken = $reg.data.token
        Write-Host "  PASS: User registered" -ForegroundColor Green
        $passed++
    }
} catch {
    Write-Host "  FAIL: $($_)" -ForegroundColor Red
    $failed++
}

# TEST 3: Login
Write-Host "[3/7] User Login" -ForegroundColor Yellow

try {
    $body = @{
        email = $Email
        password = $Password
    } | ConvertTo-Json

    $login = Invoke-RestMethod -Uri "$BaseURL/auth/login" -Method POST `
        -Headers @{"Content-Type" = "application/json"} -Body $body
    
    if ($login.success -eq $true) {
        $token = $login.data.token
        Write-Host "  PASS: Login successful" -ForegroundColor Green
        $passed++
    }
} catch {
    Write-Host "  FAIL: $($_)" -ForegroundColor Red
    $failed++
}

if (-not $token) { $token = $regToken }

# TEST 4: Get User (Protected)
Write-Host "[4/7] Get User (Protected)" -ForegroundColor Yellow

try {
    $user = Invoke-RestMethod -Uri "$BaseURL/auth/me" -Method GET `
        -Headers @{"Authorization" = "Bearer $token"}
    
    if ($user.success -eq $true) {
        Write-Host "  PASS: Retrieved user data" -ForegroundColor Green
        $passed++
    }
} catch {
    Write-Host "  FAIL: $($_)" -ForegroundColor Red
    $failed++
}

# TEST 5: Dashboard Test (Protected)
Write-Host "[5/7] Dashboard Test (Protected)" -ForegroundColor Yellow

try {
    $dash = Invoke-RestMethod -Uri "$BaseURL/auth/dashboard-test" -Method GET `
        -Headers @{"Authorization" = "Bearer $token"}
    
    if ($dash.success -eq $true) {
        Write-Host "  PASS: Dashboard route accessible" -ForegroundColor Green
        $passed++
    }
} catch {
    Write-Host "  FAIL: $($_)" -ForegroundColor Red
    $failed++
}

# TEST 6: No Token Error
Write-Host "[6/7] No Token Error Handling" -ForegroundColor Yellow

try {
    $notoken = Invoke-RestMethod -Uri "$BaseURL/auth/me" -Method GET
    Write-Host "  FAIL: Should have rejected" -ForegroundColor Red
    $failed++
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "  PASS: Correctly returned 401" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  FAIL: Wrong status $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        $failed++
    }
}

# TEST 7: Invalid Token Error
Write-Host "[7/7] Invalid Token Error Handling" -ForegroundColor Yellow

try {
    $badtoken = Invoke-RestMethod -Uri "$BaseURL/auth/me" -Method GET `
        -Headers @{"Authorization" = "Bearer invalid"}
    Write-Host "  FAIL: Should have rejected" -ForegroundColor Red
    $failed++
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "  PASS: Correctly returned 403" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  FAIL: Wrong status $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        $failed++
    }
}

# SUMMARY
Write-Host ""
Write-Host "=========================================="
Write-Host "TEST SUMMARY"
Write-Host "=========================================="
Write-Host "Total Tests: 7"
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })

if ($failed -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS! All tests passed." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "FAILED! Some tests did not pass." -ForegroundColor Red
}
Write-Host ""
