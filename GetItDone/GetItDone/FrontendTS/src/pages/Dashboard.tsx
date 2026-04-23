import { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import StatsCard from '@/components/StatsCard'
import CalendarView from '@/components/CalendarView'
import BookingDetailsModal from '@/components/BookingDetailsModal'
import CancelModal from '@/components/CancelModal'
import { getBookingsStats, getClientBookings, getCurrentUser, addServicePreference, removeServicePreference } from '@/services/api'
import { Calendar, CheckCircle, XCircle, Search, Clock, Eye, Ban, User, MapPin, DollarSign, Plus, X, Heart, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const location = useLocation() as any
  const [auth, setAuth] = useState<{ fullName?: string; uniqueUserCode?: string } | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [bookingsList, setBookingsList] = useState<any[]>([])
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  
  // Service preferences state
  const [userProfile, setUserProfile] = useState<any>(null)
  const [newPreference, setNewPreference] = useState('')

  // Get pending bookings
  const pendingBookings = bookingsList.filter(b => b.status === 'PENDING')

  const fetchBookings = () => {
    getBookingsStats('client').then(r => setStats(r.data)).catch(() => {})
    getClientBookings().then(r => {
      const data = r.data as any[]
      setBookingsList(data)
      const mapped = data.map(b => ({
        id: b.id,
        title: `${b.worker?.user?.fullName || 'Worker'}${b.status ? ` (${b.status})` : ''}`,
        start: b.startDateTime,
        end: b.endDateTime,
        status: b.status,
        cancellationReason: b.cancellationReason,
        clientId: b.client?.id,
        workerId: b.worker?.user?.id,
        worker: b.worker,
        location: b.location,
        description: b.description,
      }))
      setEvents(mapped)
    }).catch(() => {})
  }

  const fetchUserProfile = async () => {
    try {
      const response = await getCurrentUser()
      setUserProfile(response.data)
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    }
  }

  const handleAddPreference = async () => {
    if (!newPreference.trim()) return
    
    try {
      const response = await addServicePreference(newPreference.trim())
      setUserProfile(response.data)
      setNewPreference('')
      toast.success('Service preference added')
    } catch (error: any) {
      toast.error(error?.response?.data || 'Failed to add preference')
    }
  }

  const handleRemovePreference = async (preference: string) => {
    try {
      const response = await removeServicePreference(preference)
      setUserProfile(response.data)
      toast.success('Preference removed')
    } catch (error: any) {
      toast.error(error?.response?.data || 'Failed to remove preference')
    }
  }

  useEffect(() => {
    if (location?.state?.message) {
      alert(location.state.message)
      window.history.replaceState({}, document.title)
    }
    try {
      const stored = localStorage.getItem('auth')
      if (stored) setAuth(JSON.parse(stored))
    } catch {}
    fetchBookings()
    fetchUserProfile()
  }, [location])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  }

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-[#1e293b]">
            Welcome back{auth?.fullName ? `, ${auth.fullName}` : ''}!
          </h1>
          <p className="text-[#475569] mt-2 text-lg">Manage your bookings and find new workers</p>
          {auth?.uniqueUserCode && (
            <div className="inline-flex items-center space-x-1 bg-blue-50 px-4 py-2 rounded-xl text-sm text-blue-700 font-medium mt-3 border border-blue-100">
              <span>Your ID:</span>
              <span className="font-mono font-bold">{auth.uniqueUserCode}</span>
            </div>
          )}
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <StatsCard 
              title="Total Bookings" 
              value={stats?.totalBookings ?? 0} 
              icon={<Calendar size={24} />}
              color="blue"
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <StatsCard 
              title="Completed" 
              value={stats?.totalCompleted ?? 0} 
              icon={<CheckCircle size={24} />}
              color="green"
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <StatsCard 
              title="Cancelled" 
              value={stats?.totalCancelled ?? 0} 
              subtitle={`Client: ${stats?.cancelledByClient ?? 0} | Worker: ${stats?.cancelledByWorker ?? 0}`}
              icon={<XCircle size={24} />}
              color="red"
            />
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <div className="card group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] text-white border-none h-full">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/90 mb-1">Need a worker?</p>
                  <p className="text-3xl font-bold text-white mb-2">🔍</p>
                  <Link 
                    to="/search" 
                    className="text-xs font-medium bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-all inline-block"
                  >
                    Search Workers
                  </Link>
                </div>
                <div className="p-3 rounded-lg bg-white/20 group-hover:scale-110 transition-transform">
                  <Search className="text-white" size={24} />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* PENDING Bookings - Prominent Section */}
        {pendingBookings.length > 0 && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center animate-pulse">
                  <AlertCircle size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">Pending Bookings</h2>
                  <p className="text-sm text-gray-600 mt-0.5">
                    You have <span className="font-bold text-blue-700">{pendingBookings.length}</span> {pendingBookings.length === 1 ? 'booking' : 'bookings'} awaiting worker response
                  </p>
                </div>
                <div className="px-4 py-2 bg-blue-500 text-white rounded-full font-bold text-lg">
                  {pendingBookings.length}
                </div>
              </div>

              <div className="space-y-4">
                {pendingBookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    className="bg-white rounded-xl p-5 shadow-md border border-blue-200 hover:shadow-lg transition-all"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Worker Info */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          {(booking.worker?.user?.fullName || 'W')[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 text-lg">{booking.worker?.user?.fullName || 'Worker'}</h3>
                            {booking.worker?.user?.uniqueUserCode && (
                              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-mono font-semibold">
                                {booking.worker.user.uniqueUserCode}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 font-medium">{booking.worker?.jobRole || 'Professional'}</p>
                          <p className="text-xs text-gray-500 mt-1">{booking.description || 'Service Request'}</p>
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="text-blue-600" size={18} />
                          <div>
                            <p className="font-semibold text-gray-900">
                              {new Date(booking.startDateTime).toLocaleDateString('en-US', { 
                                month: 'short', day: 'numeric', year: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="text-green-600" size={18} />
                          <div>
                            <p className="font-semibold text-gray-900">
                              {new Date(booking.startDateTime).toLocaleTimeString('en-US', { 
                                hour: '2-digit', minute: '2-digit' 
                              })}
                              {' - '}
                              {new Date(booking.endDateTime).toLocaleTimeString('en-US', { 
                                hour: '2-digit', minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>

                        {booking.location && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="text-red-600" size={18} />
                            <p className="font-medium text-gray-700 max-w-xs truncate">{booking.location}</p>
                          </div>
                        )}

                        {/* Extract payment mode from description */}
                        {booking.description && booking.description.includes('Payment:') && (
                          <div className="flex items-center gap-2 text-sm">
                            <p className="font-semibold text-purple-700">
                              {booking.description.split('Payment: ')[1] || 'Payment info'}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center">
                        <span className="px-4 py-2 bg-amber-100 text-amber-800 font-semibold rounded-lg border border-amber-300 text-sm">
                          ⏳ Awaiting Response
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Service Preferences Section */}
        <motion.div 
          className="card mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <Heart size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1e293b]">Service Preferences</h3>
              <p className="text-sm text-[#475569]">Services you're interested in</p>
            </div>
          </div>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newPreference}
              onChange={(e) => setNewPreference(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddPreference()}
              placeholder="e.g., Plumbing, Electrical, Cleaning, Gardening"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
            />
            <button
              onClick={handleAddPreference}
              disabled={!newPreference.trim()}
              className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg font-medium hover:from-pink-700 hover:to-rose-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {userProfile?.servicePreferences && userProfile.servicePreferences.length > 0 ? (
              userProfile.servicePreferences.map((preference: string, idx: number) => (
                <span 
                  key={idx}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-pink-50 text-pink-700 rounded-full text-sm font-medium border border-pink-200 hover:bg-pink-100 transition-colors"
                >
                  {preference}
                  <button
                    onClick={() => handleRemovePreference(preference)}
                    className="hover:bg-pink-200 rounded-full p-0.5 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No preferences added yet. Add services you're interested in above!</p>
            )}
          </div>
        </motion.div>

        {/* Bookings Section */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#1e293b]">Your Bookings</h2>
              <p className="text-sm text-[#475569] mt-1">View and manage your scheduled services</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-[#475569]">Upcoming</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-[#475569]">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-[#475569]">Cancelled</span>
                </div>
              </div>
              <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                    viewMode === 'calendar' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Calendar size={16} className="inline mr-1" />
                  Calendar
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                    viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
          
          {viewMode === 'calendar' ? (
            <CalendarView 
              events={events} 
              onEventClick={(e) => {
                const ext = e.event.extendedProps as any
                setSelectedBooking({
                  id: ext?.id,
                  title: e.event.title,
                  status: ext?.status,
                  start: e.event.start,
                  end: e.event.end,
                  cancellationReason: ext?.cancellationReason,
                  worker: ext?.worker,
                  location: ext?.location,
                  description: ext?.description,
                })
                setShowDetails(true)
              }} 
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Worker</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Service</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date & Time</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookingsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        No bookings yet. <Link to="/search" className="text-blue-600 hover:underline">Search for workers</Link>
                      </td>
                    </tr>
                  ) : (
                    bookingsList.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                              {(booking.worker?.user?.fullName || 'W')[0]}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{booking.worker?.user?.fullName || 'Worker'}</div>
                              <div className="text-sm text-gray-500">ID: {booking.worker?.user?.uniqueUserCode || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-900">{booking.worker?.jobRole || 'Service'}</div>
                          {booking.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">{booking.description}</div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock size={14} className="text-gray-400" />
                            <div>
                              <div className="font-medium text-gray-900">
                                {new Date(booking.startDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                              <div className="text-gray-500">
                                {new Date(booking.startDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                {' - '}
                                {new Date(booking.endDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin size={14} className="text-gray-400" />
                            {booking.location || 'Not specified'}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            booking.status === 'CANCELLED' || booking.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            booking.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status || 'PENDING'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedBooking(booking)
                                setShowDetails(true)
                              }}
                              className="btn-icon-sm bg-blue-50 text-blue-600 hover:bg-blue-100"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            {(booking.status === 'PENDING' || booking.status === 'ACCEPTED' || booking.status === 'CONFIRMED') && (
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking)
                                  setShowCancel(true)
                                }}
                                className="btn-icon-sm bg-red-50 text-red-600 hover:bg-red-100"
                                title="Cancel Booking"
                              >
                                <Ban size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        <BookingDetailsModal 
          isOpen={showDetails} 
          booking={selectedBooking} 
          onClose={() => setShowDetails(false)} 
          onAction={fetchBookings} 
        />
        
        <CancelModal
          isOpen={showCancel}
          title="Cancel Booking"
          onCancel={() => setShowCancel(false)}
          onSubmit={async (reason) => {
            try {
              const { cancelBooking } = await import('@/services/api')
              await cancelBooking(selectedBooking?.id, reason)
              toast.success('Booking cancelled successfully')
              setShowCancel(false)
              fetchBookings()
            } catch (error: any) {
              toast.error(error?.response?.data || 'Failed to cancel booking')
            }
          }}
        />
      </main>
    </div>
  )
}


