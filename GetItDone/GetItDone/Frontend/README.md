# GetItDone Frontend

A fully responsive React frontend for the GetItDone service platform, built with modern web technologies.

## 🚀 Features

- **User Authentication**: Login and registration with form validation
- **Dynamic Dashboard**: Role-based dashboard for Customers, Service Providers, and Admins
- **Profile Management**: Edit profile information and change password
- **Responsive Design**: Mobile-first design using Tailwind CSS
- **State Management**: Context API for authentication state
- **API Integration**: Axios for backend communication
- **Toast Notifications**: User feedback with react-toastify

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **React Toastify** - Toast notifications
- **Context API** - State management

## 📦 Installation

1. Navigate to the Frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The app will open at `http://localhost:3000`

## 🏗️ Project Structure

```
Frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Navbar.js
│   │   └── ProtectedRoute.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Dashboard.js
│   │   └── Profile.js
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
└── README.md
```

## 🎨 UI Components

### Pages
- **Login Page**: Email/password authentication with validation
- **Registration Page**: User registration with role selection
- **Dashboard**: Dynamic content based on user role
- **Profile Page**: Edit user information and change password

### Features
- **Responsive Navigation**: Mobile-friendly navbar with hamburger menu
- **Form Validation**: Client-side validation with error messages
- **Loading States**: Spinners and loading indicators
- **Toast Notifications**: Success/error feedback
- **Protected Routes**: Authentication-based route protection

## 🔧 Configuration

### API Configuration
Update the API base URL in `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8080/api/v1';
```

### Tailwind Configuration
Custom colors and theme settings in `tailwind.config.js`:
- Primary: Green color scheme
- Secondary: Blue color scheme
- Responsive breakpoints

## 🚀 Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## 📱 Responsive Design

The application is fully responsive with:
- **Mobile**: Single column layout with collapsible navigation
- **Tablet**: Two-column layout for forms and content
- **Desktop**: Multi-column layout with sidebar navigation

## 🔐 Authentication Flow

1. **Registration**: Users can register with email, password, and role selection
2. **Login**: Email/password authentication with JWT token storage
3. **Protected Routes**: Automatic redirect to login for unauthenticated users
4. **Logout**: Token cleanup and redirect to login page

## 🎯 User Roles

### Customer Dashboard
- Current bookings
- Booking history
- Service ratings

### Service Provider Dashboard
- Earnings overview
- Service listings
- Booking requests
- Performance metrics

### Admin Dashboard
- User statistics
- System overview
- Revenue tracking
- Activity monitoring

## 🚀 Deployment

1. Build the production version:
   ```bash
   npm run build
   ```

2. Deploy the `build` folder to your hosting service:
   - Netlify
   - Vercel
   - AWS S3
   - Firebase Hosting

## 🔗 Backend Integration

The frontend integrates with the Spring Boot backend API:
- `POST /api/v1/users/register` - User registration
- `POST /api/v1/users/login` - User authentication
- `GET /api/v1/users/{id}` - Get user details
- `PUT /api/v1/users/{id}` - Update user
- `DELETE /api/v1/users/{id}` - Delete user

## 🎨 Design System

### Colors
- **Primary**: Green (#22c55e) - Main brand color
- **Secondary**: Blue (#3b82f6) - Accent color
- **Gray**: Various shades for text and backgrounds

### Typography
- **Headings**: Bold, large text for hierarchy
- **Body**: Regular weight for readability
- **Labels**: Medium weight for form labels

### Components
- **Cards**: White background with shadow
- **Buttons**: Rounded corners with hover effects
- **Forms**: Clean input fields with validation
- **Navigation**: Fixed header with mobile menu

## 📝 Development Notes

- All components use functional components with hooks
- State management handled by Context API
- Form validation with custom error handling
- Responsive design with Tailwind utility classes
- API calls with Axios interceptors for authentication
- Toast notifications for user feedback

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the GetItDone service platform.
