import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { FiHome, FiSearch, FiGrid, FiLogOut, FiUser, FiMenu, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [role, setRole] = useState<'client' | 'worker'>('client')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('roleToggle')
    if (stored === 'worker' || stored === 'client') setRole(stored)
  }, [])

  const handleToggle = (r: 'client' | 'worker') => {
    setRole(r)
    localStorage.setItem('roleToggle', r)
    if (r === 'worker') navigate('/dashboard-worker')
    else navigate('/dashboard')
    toast.success(`Switched to ${r} view`)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    toast.success('Logged out successfully')
  }

  const isActive = (path: string) => location.pathname === path

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">GetItDone</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/" icon={<FiHome />} label="Home" isActive={isActive('/')} />
            <NavLink to="/search" icon={<FiSearch />} label="Search" isActive={isActive('/search')} />
            {user && (
              <NavLink 
                to={role === 'worker' ? '/dashboard-worker' : '/dashboard'} 
                icon={<FiGrid />} 
                label="Dashboard" 
                isActive={isActive('/dashboard') || isActive('/dashboard-worker')} 
              />
            )}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* Role Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => handleToggle('client')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                      role === 'client'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Client
                  </button>
                  <button
                    onClick={() => handleToggle('worker')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                      role === 'worker'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Worker
                  </button>
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 focus:outline-none group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold group-hover:scale-105 transition-transform">
                      {getInitials(user.fullName)}
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 border border-gray-100">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user.fullName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        {user.uniqueUserCode && (
                          <p className="text-xs text-blue-600 mt-1">ID: {user.uniqueUserCode}</p>
                        )}
                      </div>
                      <button
                        onClick={() => { navigate('/dashboard/edit-profile'); setShowUserMenu(false) }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <FiUser className="text-gray-400" />
                        <span>Edit Profile</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <FiLogOut />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {showMobileMenu ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <div className="space-y-2">
              <MobileNavLink to="/" icon={<FiHome />} label="Home" onClick={() => setShowMobileMenu(false)} />
              <MobileNavLink to="/search" icon={<FiSearch />} label="Search" onClick={() => setShowMobileMenu(false)} />
              {user && (
                <>
                  <MobileNavLink 
                    to={role === 'worker' ? '/dashboard-worker' : '/dashboard'} 
                    icon={<FiGrid />} 
                    label="Dashboard" 
                    onClick={() => setShowMobileMenu(false)} 
                  />
                  <div className="px-4 py-2">
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => { handleToggle('client'); setShowMobileMenu(false) }}
                        className={`flex-1 py-2 rounded-md text-sm font-medium ${
                          role === 'client' ? 'bg-white text-blue-600' : 'text-gray-600'
                        }`}
                      >
                        Client
                      </button>
                      <button
                        onClick={() => { handleToggle('worker'); setShowMobileMenu(false) }}
                        className={`flex-1 py-2 rounded-md text-sm font-medium ${
                          role === 'worker' ? 'bg-white text-blue-600' : 'text-gray-600'
                        }`}
                      >
                        Worker
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-red-600 flex items-center space-x-3 hover:bg-red-50 rounded-lg"
                  >
                    <FiLogOut />
                    <span>Logout</span>
                  </button>
                </>
              )}
              {!user && (
                <div className="px-4 space-y-2">
                  <Link to="/login" className="block w-full text-center py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg">
                    Login
                  </Link>
                  <Link to="/register" className="block w-full text-center btn-primary">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

function NavLink({ to, icon, label, isActive }: { to: string; icon: React.ReactNode; label: string; isActive: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        isActive
          ? 'bg-blue-50 text-blue-600'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}

function MobileNavLink({ to, icon, label, onClick }: { to: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}
