# Registration Debug Guide

## 🚀 Step-by-Step Testing

### 1. Check Servers Are Running

**Backend (Spring Boot)**
```powershell
# Check if port 8080 is listening
netstat -ano | findstr ":8080"
```
Expected: Should show a process listening on port 8080

**Frontend (Vite)**
```powershell
# Check if port 5173 or 5174 is listening
netstat -ano | findstr ":5173"
netstat -ano | findstr ":5174"
```
Expected: Should show a process listening on one of these ports

---

### 2. Open Frontend in Browser

1. Open your browser (Chrome/Edge recommended for better dev tools)
2. Navigate to: **http://localhost:5173** or **http://localhost:5174**
3. Go to the registration page: **http://localhost:5173/register**

---

### 3. Open Browser Developer Tools

**Press F12** or **Right-click → Inspect**

You'll need to check **3 tabs**:

#### Tab 1: Console
- Shows JavaScript errors
- Shows console.log messages
- Shows API call errors

#### Tab 2: Network
- Click on "Network" tab
- Check "Preserve log" checkbox
- This will show all HTTP requests

#### Tab 3: Application (for localStorage)
- Check if auth data is stored after registration

---

### 4. Fill Registration Form

Use this **TEST DATA**:

```
Full Name: John Test User
Email: john.test@example.com
Phone: 9876543210
Password: test123456
Role: CLIENT

Aadhaar: 123456789012
PAN: (leave empty - testing Aadhaar only)

Upload Document: 
  - Create a simple image or use any small image file
  - Make sure it's under 5MB

UPI ID: john@paytm
Date of Birth: 1990-01-01
Address: Test Address, City (optional)
```

---

### 5. Click "Create Account" Button

**Watch the Console tab** - look for:
- ✅ No red error messages = Good
- ❌ Red error messages = Copy the entire error

**Watch the Network tab** - look for:
- A POST request to `/api/auth/register`
- Click on this request
- Check the **Headers** tab:
  - Request URL should be: `http://localhost:8080/api/auth/register`
  - Request Method: POST
  - Content-Type: multipart/form-data
- Check the **Payload** tab:
  - Should show all form fields
- Check the **Response** tab:
  - Status code 200 = Success ✅
  - Status code 400 = Validation error ❌
  - Status code 500 = Server error ❌

---

### 6. Common Errors and Solutions

#### Error: "Network Error"
**Cause**: Backend not running or CORS issue
**Solution**:
```powershell
# Check if backend is running
netstat -ano | findstr ":8080"

# If not running, start it:
cd "d:\Spring Boot Java Pep\GetItDoneSB"
.\mvnw.cmd spring-boot:run
```

#### Error: "Failed to fetch"
**Cause**: Frontend can't reach backend
**Solution**:
- Check backend is running on port 8080
- Check CORS configuration in AuthController.java

#### Error: "400 Bad Request"
**Cause**: Validation error on backend
**Solution**:
- Check the response body in Network tab
- It will tell you which field is invalid

#### Error: "500 Internal Server Error"
**Cause**: Backend exception
**Solution**:
- Check backend console/terminal for Java stack trace
- Look for the error message

#### Error: "Document upload failed"
**Cause**: File too large or wrong format
**Solution**:
- Use image under 5MB
- Use PNG, JPG, JPEG format only

---

### 7. Check Backend Logs

In the terminal where backend is running, look for:

**Successful Registration:**
```
INFO ... DispatcherServlet : POST "/api/auth/register", parameters={}
INFO ... UserService : Registering user: john.test@example.com
```

**Error:**
```
ERROR ... : Registration failed: <error message>
```

Copy the ENTIRE error stack trace if you see one.

---

### 8. Verify User in Database

After successful registration, check PostgreSQL:

```sql
-- Connect to your PostgreSQL database
psql -U postgres -d getitdone_db

-- Check if user was created
SELECT id, full_name, email, unique_user_code, role 
FROM users 
WHERE email = 'john.test@example.com';

-- Check all users
SELECT id, full_name, email, unique_user_code, role, created_at 
FROM users 
ORDER BY created_at DESC;
```

Expected output:
```
 id | full_name       | email                   | unique_user_code | role
----+-----------------+-------------------------+------------------+--------
 XX | John Test User  | john.test@example.com   | 26X              | CLIENT
```

---

## 📋 Checklist Before Testing

- [ ] PostgreSQL database is running
- [ ] Backend server started successfully (port 8080)
- [ ] Frontend server started successfully (port 5173 or 5174)
- [ ] Browser dev tools are open (F12)
- [ ] Network tab is recording
- [ ] Test image file is ready (under 5MB)

---

## 🐛 What to Share if It Still Fails

1. **Browser Console Error** (screenshot or copy text)
2. **Network Tab Response** (screenshot of the failed request)
3. **Backend Terminal Output** (copy the error stack trace)
4. **Form Data You Used** (what values did you enter?)

---

## ✅ Success Indicators

If registration works, you should see:

1. **Browser**:
   - Toast message: "🎉 User registered successfully!"
   - Automatic redirect to login page after 2 seconds

2. **Network Tab**:
   - POST request to `/api/auth/register`
   - Status: 200 OK
   - Response body contains:
     ```json
     {
       "userId": 123,
       "email": "john.test@example.com",
       "fullName": "John Test User",
       "uniqueUserCode": "261",
       "role": "CLIENT",
       "message": "User registered successfully"
     }
     ```

3. **Backend Logs**:
   - No error messages
   - Shows successful Hibernate INSERT

4. **Database**:
   - New row in `users` table
   - User has a unique_user_code starting with "26"

---

## 🔧 Quick Fix Commands

```powershell
# Kill all Java processes (if backend won't start)
taskkill /F /IM java.exe

# Kill all Node processes (if frontend won't start)
taskkill /F /IM node.exe

# Restart backend
cd "d:\Spring Boot Java Pep\GetItDoneSB"
.\mvnw.cmd spring-boot:run

# Restart frontend
cd "d:\Spring Boot Java Pep\GetItDoneSB\FrontendTS"
npm run dev

# Check database connection
psql -U postgres -c "\l"
```

---

## 📞 Need More Help?

Share the following information:

1. Screenshot of browser console (with error in red)
2. Screenshot of Network tab (showing the failed request)
3. Backend terminal output (last 50 lines)
4. Which test data you used

This will help diagnose the exact issue!
