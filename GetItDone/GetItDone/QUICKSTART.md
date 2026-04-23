# 🚀 Quick Start - GetItDone

## 1️⃣ Database Setup (One-time)

```sql
CREATE DATABASE getitdone;
```

Update `src/main/resources/application.properties`:
```properties
spring.datasource.password=YOUR_PASSWORD
```

---

## 2️⃣ Start Backend

**Double-click**: `start-backend.bat`

OR run in terminal:
```powershell
.\mvnw spring-boot:run
```

✅ Backend running at: **http://localhost:8080**

---

## 3️⃣ Start Frontend

**Double-click**: `start-frontend.bat`

OR run in terminal:
```powershell
cd FrontendTS
npm install
npm run dev
```

✅ Frontend running at: **http://localhost:5173**

---

## 4️⃣ First-Time Usage

1. Open browser: **http://localhost:5173**
2. Click **Register**
3. Fill form (choose CLIENT or WORKER role)
4. Click **Login** 
5. Login with email or phone
6. Complete profile setup

---

## 🎯 Test Scenarios

### As CLIENT:
1. Go to **Find Workers**
2. Search by job title or name
3. Click a worker → **Book Service**
4. Fill booking details → Submit
5. View booking in **Dashboard**

### As WORKER:
1. Complete **Worker Profile**
2. Set availability and rates
3. Go to **Worker Dashboard**
4. See incoming booking requests
5. **Accept** or **Reject** bookings

---

## 📌 Quick Links

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080/api
- **Database**: PostgreSQL on localhost:5432

---

## 🔐 Test Users

After first run, create:
- **Client**: `client@test.com` / password
- **Worker**: `worker@test.com` / password

---

## ⚡ Troubleshooting

**Port 8080 busy?**
→ Change `server.port` in `application.properties`

**CORS error?**
→ Check backend logs - CORS is configured

**Can't connect to DB?**
→ Verify PostgreSQL is running

**Frontend not loading?**
→ Run `npm install` in FrontendTS folder

---

## 📚 Full Documentation

See `README.md` for complete documentation
See `PROJECT_ANALYSIS.md` for technical details

---

**You're all set! 🎉**
