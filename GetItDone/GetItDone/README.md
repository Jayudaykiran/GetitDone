*** End Patch
├── src/main/resources/
│   ├── application.properties
│   └── db/schema.sql
├── Frontend/           # React JS Frontend (Legacy)
└── FrontendTS/        # React TS Frontend (Recommended)
```

---

## 🔐 Security

- JWT-based authentication
- BCrypt password encoding
- CORS configured for local development
- Role-based authorization (CLIENT, WORKER)
- Protected routes in frontend
- Token stored in localStorage
- Automatic token injection in API requests

---

## 🧪 Testing

### Backend Tests
```powershell
.\mvnw test
```

### Frontend Tests
```powershell
cd FrontendTS
npm test
```

---

## 📦 Building for Production

### Backend
```powershell
.\mvnw clean package
java -jar target/GetItDoneSB-0.0.1-SNAPSHOT.jar
```

### Frontend
```powershell
cd FrontendTS
npm run build
# Output in dist/ folder
```

---

## 🐛 Common Issues & Solutions

### Issue: Database connection refused
**Solution**: Ensure PostgreSQL is running and credentials are correct

### Issue: CORS errors in browser
**Solution**: Backend CORS is configured for localhost:3000 and localhost:5173. If using different port, update `WebConfig.java`

### Issue: JWT token expired
**Solution**: Login again to get a new token

### Issue: Port already in use
**Backend**: Change `server.port` in application.properties
**Frontend**: Kill the process using the port or use a different port

---

## 🔄 Development Workflow

1. **Start PostgreSQL database**
2. **Run backend** (`mvnw spring-boot:run`)
3. **Run frontend** (`npm run dev` in FrontendTS)
4. **Register a user** at http://localhost:5173/register
5. **Login** and setup profile
6. **Test features**:
   - As CLIENT: Search workers, create bookings
   - As WORKER: Create profile, manage bookings

---

## 📝 Environment Variables

### Backend
Set in `application.properties` or as environment variables:
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET`

### Frontend
Create `.env` file:
- `VITE_API_BASE` (for FrontendTS)
- `REACT_APP_API_BASE` (for Frontend)

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## 📄 License

This project is for educational purposes.

---

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section
2. Review backend logs in console
3. Check browser console for frontend errors
4. Verify database connection

---

## 🎓 Learning Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Introduction](https://jwt.io/introduction)

---

**Happy Coding! 🚀**
