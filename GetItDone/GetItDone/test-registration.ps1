# GetItDone Registration Test Script
# This script tests the registration API endpoint

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   GetItDone Registration API Test" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Test data
$testData = @{
    fullName = "Test User"
    email = "test.user.$(Get-Random -Minimum 1000 -Maximum 9999)@example.com"
    phoneNumber = "9876543210"
    password = "test123456"
    role = "CLIENT"
    aadhaarNo = "123456789012"
    upiId = "test@paytm"
    dob = "1990-01-01"
}

Write-Host "Test Data:" -ForegroundColor Yellow
Write-Host "  Full Name: $($testData.fullName)"
Write-Host "  Email: $($testData.email)"
Write-Host "  Phone: $($testData.phoneNumber)"
Write-Host "  Role: $($testData.role)"
Write-Host "  Aadhaar: $($testData.aadhaarNo)"
Write-Host "  UPI ID: $($testData.upiId)"
Write-Host "  DOB: $($testData.dob)"
Write-Host ""

# Check if backend is running
Write-Host "Step 1: Checking if backend is running..." -ForegroundColor Cyan
$backendRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login" -Method OPTIONS -TimeoutSec 2 -ErrorAction SilentlyContinue
    $backendRunning = $true
    Write-Host "  ✓ Backend is running on port 8080" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Backend is NOT running on port 8080" -ForegroundColor Red
    Write-Host "  Please start backend with: .\mvnw.cmd spring-boot:run" -ForegroundColor Yellow
}

# Check if frontend is running
Write-Host "Step 2: Checking if frontend is running..." -ForegroundColor Cyan
$frontendRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173/" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
    $frontendRunning = $true
    Write-Host "  ✓ Frontend is running on port 5173" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Frontend is NOT running on port 5173" -ForegroundColor Yellow
    Write-Host "  (Frontend not required for this test)" -ForegroundColor Gray
}

Write-Host ""

if (-not $backendRunning) {
    Write-Host "Cannot proceed - Backend must be running!" -ForegroundColor Red
    exit 1
}

# Test registration
Write-Host "Step 3: Testing registration API..." -ForegroundColor Cyan
Write-Host ""

try {
    # Create multipart form data boundary
    $boundary = [System.Guid]::NewGuid().ToString()
    
    # Build multipart form data body
    $bodyLines = @()
    foreach ($key in $testData.Keys) {
        $bodyLines += "--$boundary"
        $bodyLines += "Content-Disposition: form-data; name=`"$key`""
        $bodyLines += ""
        $bodyLines += $testData[$key]
    }
    $bodyLines += "--$boundary--"
    
    $body = $bodyLines -join "`r`n"
    
    # Send request
    $response = Invoke-WebRequest `
        -Uri "http://localhost:8080/api/auth/register" `
        -Method POST `
        -ContentType "multipart/form-data; boundary=$boundary" `
        -Body $body
    
    Write-Host "SUCCESS! ✓" -ForegroundColor Green
    Write-Host ""
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Yellow
    Write-Host $response.Content
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "User registered successfully!" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Check PostgreSQL database for the new user"
    Write-Host "2. Try logging in with:"
    Write-Host "   Email: $($testData.email)"
    Write-Host "   Password: $($testData.password)"
    Write-Host ""
    
} catch {
    Write-Host "FAILED! ✗" -ForegroundColor Red
    Write-Host ""
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error Message:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message
    Write-Host ""
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body:" -ForegroundColor Yellow
        Write-Host $responseBody
        Write-Host ""
    }
    
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "Possible issues:" -ForegroundColor Yellow
    Write-Host "- Email already exists in database"
    Write-Host "- Validation error (check field formats)"
    Write-Host "- Backend error (check backend terminal)"
    Write-Host "- Database connection issue"
    Write-Host ""
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
