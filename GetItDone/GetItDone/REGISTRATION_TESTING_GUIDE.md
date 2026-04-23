# 🎯 Registration Testing - Complete Guide

## ✅ Current Status

### Servers Running
- ✅ **Backend**: http://localhost:8080 (Spring Boot + PostgreSQL)
- ✅ **Frontend**: http://localhost:5173 (React + TypeScript + Vite)

### Recent Fixes Applied
- ✅ Fixed RegisterPage.tsx (removed stray text)
- ✅ Backend configured for multipart/form-data
- ✅ CORS enabled for ports 5173-5176
- ✅ Field name corrected: `phoneNumber` (not `phone`)

---

## 🧪 Three Ways to Test Registration

### Method 1: Use the Frontend App (Recommended for Users)

1. **Open your browser**
   ```
   http://localhost:5173/register
   ```

2. **Fill the form** with test data:
   ```
   Full Name: John Test
   Email: john.test@example.com
   Phone: 9876543210
   Password: test123456
   Role: CLIENT
   Aadhaar: 123456789012
   UPI ID: john@paytm
   DOB: 1990-01-01
   Document: Upload any small image file
   ```

3. **Open Browser DevTools (F12)**
   - **Console tab**: Check for JavaScript errors
   - **Network tab**: Look for POST to `/api/auth/register`
   - **Response**: Should be 200 OK with user data

4. **Expected Result**
   - ✅ Toast message: "🎉 User registered successfully!"
   - ✅ Redirect to login page after 2 seconds
   - ✅ User saved in database

---

### Method 2: Use the Test HTML Page (Instant Testing)

1. **Open the test page**
   ```
   d:\Spring Boot Java Pep\GetItDoneSB\test-registration.html
   ```
   (Double-click the file to open in browser)

2. **Click "Check Server Status"**
   - Should show both servers running

3. **Click "Test Registration"**
   - Automatically sends a test registration request
   - Shows the response in the page
   - No need to fill forms!

4. **If successful**
   - Green success message appears
   - Check database for new user

---

### Method 3: Use PowerShell Script (Command Line)

1. **Open PowerShell in the project folder**
   ```powershell
   cd "d:\Spring Boot Java Pep\GetItDoneSB"
   ```

2. **Run the test script**
   ```powershell
   .\test-registration.ps1
   ```

3. **What it does**
   - Checks if backend is running
   - Sends a registration request with random email
   - Shows the response
   - Tells you if it succeeded or failed

---

## 🔍 How to Debug Errors

### If Registration Fails in Browser

1. **Open DevTools (F12)** → **Console tab**
   
   **Look for errors like:**
   - ❌ `Network Error` → Backend not running or CORS issue
   - ❌ `Failed to fetch` → Backend unreachable
   - ❌ `400 Bad Request` → Validation error (check which field)
   - ❌ `500 Internal Server Error` → Backend exception

2. **Open DevTools (F12)** → **Network tab**
   
   - Find the POST request to `/api/auth/register`
   - Click on it
   - Check **Response** tab for error message
   - Check **Payload** tab to see what was sent

3. **Check Backend Terminal**
   
   Look for error messages like:
   ```
   ERROR: Registration failed: <error message>
   java.lang.IllegalArgumentException: <details>
   ```

---

## 📊 Verify User in Database

After successful registration, check PostgreSQL:

```sql
-- Open PostgreSQL command line
psql -U postgres -d getitdone_db

-- Check if user was created
SELECT id, full_name, email, unique_user_code, role, phone_number, aadhaar_no, upi_id
FROM users 
WHERE email = 'john.test@example.com';

-- Check all users (latest first)
SELECT id, full_name, email, unique_user_code, role, created_at
FROM users 
ORDER BY created_at DESC
LIMIT 10;
```

**Expected Output:**
```
 id | full_name  | email                  | unique_user_code | role    | phone_number
----+------------+------------------------+------------------+---------+--------------
 XX | John Test  | john.test@example.com  | 26X              | CLIENT  | 9876543210
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Network Error" in Browser
**Cause**: Backend not running or wrong port

**Solution**:
```powershell
# Check if backend is running
netstat -ano | findstr ":8080"

# If not, start it
cd "d:\Spring Boot Java Pep\GetItDoneSB"
.\mvnw.cmd spring-boot:run
```

---

### Issue 2: "Email already exists"
**Cause**: User with that email already in database

**Solution**: Use a different email or delete the existing user:
```sql
DELETE FROM users WHERE email = 'john.test@example.com';
```

---

### Issue 3: "Document image is required"
**Cause**: No file uploaded

**Solution**: 
- Upload any small image (PNG, JPG)
- Make sure it's under 5MB

---

### Issue 4: "Either Aadhaar or PAN is required"
**Cause**: Both fields are empty

**Solution**: Fill at least ONE of these:
- **Aadhaar**: 12 digits (e.g., 123456789012)
- **PAN**: Format ABCDE1234F (5 letters + 4 digits + 1 letter)

---

### Issue 5: Backend shows "Port 8080 already in use"
**Cause**: Another Java process is using port 8080

**Solution**:
```powershell
# Find the process
netstat -ano | findstr ":8080"

# Kill it (replace XXXX with PID)
taskkill /F /PID XXXX

# Restart backend
.\mvnw.cmd spring-boot:run
```

---

## ✅ Success Checklist

After registration succeeds, you should see:

- [ ] Toast message in browser: "🎉 User registered successfully!"
- [ ] Automatic redirect to login page (2 seconds)
- [ ] Network tab shows: POST `/api/auth/register` → 200 OK
- [ ] Response contains:
  ```json
  {
    "userId": 123,
    "email": "john.test@example.com",
    "fullName": "John Test",
    "uniqueUserCode": "261",
    "role": "CLIENT",
    "message": "User registered successfully"
  }
  ```
- [ ] User exists in PostgreSQL database
- [ ] User has a `unique_user_code` starting with "26"
- [ ] Can log in with the registered credentials

---

## 🚀 Next Steps After Successful Registration

1. **Try logging in**
   - Go to: http://localhost:5173/login
   - Use the email and password you registered with
   - Should get a JWT token and redirect to dashboard

2. **Test the dashboard**
   - View your profile
   - Search for workers (if CLIENT)
   - View bookings

3. **Register a WORKER user**
   - Use the same steps but select "WORKER" role
   - Add job title (e.g., "Plumber")
   - Login as worker to see worker dashboard

---

## 📞 If You Still Need Help

Please provide:

1. **Screenshot of browser console** (F12 → Console tab)
2. **Screenshot of Network tab** (the failed POST request)
3. **Backend terminal output** (last 50 lines)
4. **Which test method you used** (Frontend, HTML page, or PowerShell)
5. **Test data you entered** (email, phone, etc.)

This will help diagnose the exact issue!

---

**Last Updated**: November 13, 2025
**Status**: ✅ Ready for testing!
