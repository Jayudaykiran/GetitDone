import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPageNew'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import Dashboard from './pages/Dashboard'
import SkillsPage from './pages/SkillsPage'
import SearchResults from './pages/SearchResults'
import WorkerProfile from './pages/WorkerProfile'
import DashboardWorker from './pages/DashboardWorker'
import EditProfilePage from './pages/EditProfilePage'
import ChatbotWidget from './components/ChatbotWidget'

export default function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard-client" element={<Dashboard />} />
        <Route path="/dashboard-worker" element={<DashboardWorker />} />
        <Route path="/dashboard/edit-profile" element={<EditProfilePage />} />
        <Route path="/dashboard/skills" element={<SkillsPage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/workers/:id" element={<WorkerProfile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ChatbotWidget />
    </div>
  )
}



