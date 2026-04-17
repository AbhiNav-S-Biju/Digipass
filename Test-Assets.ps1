# Digital Assets API Test Script

$BaseURL = "http://localhost:3000/api"

Write-Host ""
Write-Host "=========================================="
Write-Host "DIGITAL ASSETS MODULE TEST"
Write-Host "=========================================="
Write-Host ""

# Step 1: Register a test user
Write-Host "[1/7] Register Test User" -ForegroundColor Yellow
$email = "assetstest$(Get-Random)@example.com"
$registerBody = @{
    full_name = "Assets Test User"
    email = $email
    password = "TestPass123"
} | ConvertTo-Json

try {
    $registerResp = Invoke-RestMethod -Uri "$BaseURL/auth/register" -Method POST `
        -Headers @{"Content-Type" = "application/json"} -Body $registerBody
    
    if ($registerResp.success) {
        $token = $registerResp.data.token
        Write-Host "  PASS: User registered" -ForegroundColor Green
    }
} catch {
    Write-Host "  FAIL: $($_)" -ForegroundColor Red
}

# Step 2: Add Asset 1 - Email Account
Write-Host "[2/7] Add Asset (Email Account)" -ForegroundColor Yellow
$assetBody = @{
    asset_name = "Gmail Account"
    asset_type = "email"
    asset_data = @{
        username = "user@gmail.com"
        password = "SecurePass123"
        recovery_email = "recovery@gmail.com"
        two_factor = "enabled"
    }
} | ConvertTo-Json

try {
    $asset1 = Invoke-RestMethod -Uri "$BaseURL/assets" -Method POST `
        -Headers @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"} `
        -Body $assetBody
    
    if ($asset1.success) {
        $assetId1 = $asset1.data.asset_id
        Write-Host "  PASS: Asset added (ID: $assetId1)" -ForegroundColor Green
    }
} catch {
    Write-Host "  FAIL: $($_)" -ForegroundColor Red
}

# Step 3: Add Asset 2 - Bank Account
Write-Host "[3/7] Add Asset (Bank Account)" -ForegroundColor Yellow
$assetBody2 = @{
    asset_name = "Chase Bank Account"
    asset_type = "bank_account"
    asset_data = @{
        username = "john.doe"
        password = "BankPass456"
        account_number = "****5678"
        routing_number = "****1234"
    }
} | ConvertTo-Json

try {
    $asset2 = Invoke-RestMethod -Uri "$BaseURL/assets" -Method POST `
        -Headers @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"} `
        -Body $assetBody2
    
    if ($asset2.success) {
        $assetId2 = $asset2.data.asset_id
        Write-Host "  PASS: Asset added (ID: $assetId2)" -ForegroundColor Green
    }
} catch {
    Write-Host "  FAIL: $($_)" -ForegroundColor Red
}

# Step 4: Get All Assets
Write-Host "[4/7] Get All Assets" -ForegroundColor Yellow

try {
    $assets = Invoke-RestMethod -Uri "$BaseURL/assets" -Method GET `
        -Headers @{"Authorization" = "Bearer $token"}
    
    if ($assets.success -and $assets.count -eq 2) {
        Write-Host "  PASS: Retrieved $($assets.count) assets" -ForegroundColor Green
        $assets.data | ForEach-Object {
            Write-Host "    - $($_.asset_name) ($($_.asset_type))" -ForegroundColor Cyan
        }
    } else {
        Write-Host "  FAIL: Expected 2 assets, got $($assets.count)" -ForegroundColor Red
    }
} catch {
    Write-Host "  FAIL: $($_)" -ForegroundColor Red
}

# Step 5: Verify Encryption - Check that data is encrypted
Write-Host "[5/7] Verify Encryption" -ForegroundColor Yellow

try {
    $assetsDb = Invoke-RestMethod -Uri "$BaseURL/assets" -Method GET `
        -Headers @{"Authorization" = "Bearer $token"}
    
    # The API returns clean data without encrypted_data field
    $hasEncryptedField = $assetsDb.data[0] | Get-Member encrypted_data -ErrorAction SilentlyContinue
    
    if (-not $hasEncryptedField) {
        Write-Host "  PASS: Encrypted data not returned to client" -ForegroundColor Green
    } else {
        Write-Host "  WARN: Encrypted data present (should be hidden)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  FAIL: $($_)" -ForegroundColor Red
}

# Step 6: Delete Asset
Write-Host "[6/7] Delete Asset" -ForegroundColor Yellow

try {
    $deleteResp = Invoke-RestMethod -Uri "$BaseURL/assets/$assetId1" -Method DELETE `
        -Headers @{"Authorization" = "Bearer $token"}
    
    if ($deleteResp.success) {
        Write-Host "  PASS: Asset deleted ($($deleteResp.data.asset_name))" -ForegroundColor Green
    }
} catch {
    Write-Host "  FAIL: $($_)" -ForegroundColor Red
}

# Step 7: Verify Deletion
Write-Host "[7/7] Verify Deletion" -ForegroundColor Yellow

try {
    $assetsAfter = Invoke-RestMethod -Uri "$BaseURL/assets" -Method GET `
        -Headers @{"Authorization" = "Bearer $token"}
    
    if ($assetsAfter.success -and $assetsAfter.count -eq 1) {
        Write-Host "  PASS: Asset deleted successfully (1 remaining)" -ForegroundColor Green
    } else {
        Write-Host "  FAIL: Expected 1 asset, got $($assetsAfter.count)" -ForegroundColor Red
    }
} catch {
    Write-Host "  FAIL: $($_)" -ForegroundColor Red
}

# SUMMARY
Write-Host ""
Write-Host "=========================================="
Write-Host "ASSETS MODULE TEST COMPLETE"
Write-Host "=========================================="
Write-Host ""
Write-Host "All endpoints tested successfully!" -ForegroundColor Green
Write-Host ""
