# 🚀 Quick Start - Test Registration NOW!

## ✅ Servers Are Running!
- ✅ **Backend**: http://localhost:8080
- ✅ **Frontend**: http://localhost:5173

---

## 🎯 Fastest Way to Test (Choose ONE method)

### 🌐 Method 1: Browser Test Page (30 seconds)

1. **Double-click this file:**
   ```
   d:\Spring Boot Java Pep\GetItDoneSB\test-registration.html
   ```

2. **Click buttons:**
   - "Check Server Status" → Should show ✅ green
   - "Test Registration" → Sends test data automatically
   
3. **Result:**
   - ✅ Green = Success! User registered
   - ❌ Red = Failed (see error message)

---

### 💻 Method 2: Use the Real App (2 minutes)

1. **Open browser:**
   ```
   http://localhost:5173/register
   ```

2. **Fill the form:**
   ```
   Name: John Test
   Email: john@test.com
   Phone: 9876543210
   Password: test123
   Role: CLIENT
   Aadhaar: 123456789012
   UPI: john@paytm
   DOB: 1990-01-01
   Document: Upload any image
   ```

3. **Click "Create Account"**

4. **Press F12** → Check Console/Network tabs for errors

---

### ⚡ Method 3: PowerShell Script (10 seconds)

```powershell
cd "d:\Spring Boot Java Pep\GetItDoneSB"
.\test-registration.ps1
```

Automatically tests registration and shows result!

---

## 🔍 What to Check

### ✅ Success Signs
- Toast: "🎉 User registered successfully!"
- Redirects to login page
- Status 200 in Network tab
- User in database

### ❌ Error Signs
- Red error in console
- Status 400/500 in Network tab
- No redirect happens
- Error toast appears

---

## 📋 Verify in Database

```sql
-- Open PostgreSQL
psql -U postgres -d getitdone_db

-- Check latest users
SELECT full_name, email, unique_user_code, role 
FROM users 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 🐛 Quick Fixes

### "Network Error"
```powershell
# Backend not running - restart it
cd "d:\Spring Boot Java Pep\GetItDoneSB"
.\mvnw.cmd spring-boot:run
```

### "Email already exists"
```sql
-- Delete test user
DELETE FROM users WHERE email = 'john@test.com';
```

### "Port 8080 in use"
```powershell
# Find and kill process
netstat -ano | findstr ":8080"
taskkill /F /PID <number>
```

---

## 📱 Test Different User Types

### Test CLIENT (default)
```
Role: CLIENT
Job Title: (leave empty)
```

### Test WORKER
```
Role: WORKER
Job Title: Plumber
```

---

## 🎉 After Successful Registration

1. **Login:**
   ```
   http://localhost:5173/login
   ```

2. **View Dashboard:**
   - CLIENT: http://localhost:5173/dashboard
   - WORKER: http://localhost:5173/dashboard-worker

3. **Test Features:**
   - Search workers
   - Create bookings
   - View calendar

---

## 📞 Still Having Issues?

**Share these 3 things:**

1. **Browser Console** (F12 → Console tab screenshot)
2. **Network Tab** (F12 → Network tab screenshot)  
3. **Backend Terminal** (copy last 20 lines)

---

**Current Time**: Ready to test RIGHT NOW!
**Status**: Both servers running ✅
**Next Step**: Pick a test method above and try it!
