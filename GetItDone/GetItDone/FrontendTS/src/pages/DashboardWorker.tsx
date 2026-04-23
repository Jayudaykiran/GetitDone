import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import CalendarView from '../components/CalendarView'
import BookingDetailsModal from '@/components/BookingDetailsModal'
import CancelModal from '@/components/CancelModal'
import BookingActionModal from '@/components/BookingActionModal'
import StatsCard from '@/components/StatsCard'
import { getBookingsStats, getWorkerBookings, rejectBooking, acceptBooking, addWorkerSkill, removeWorkerSkill } from '@/services/api'
import { getMyWorkerProfile } from '@/services/workerService'
import { Calendar, CheckCircle, XCircle, Clock, Eye, Ban, Check, User, MapPin, Plus, X, Tag, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DashboardWorker() {
  const [events, setEvents] = useState<any[]>([])
  const [bookingsList, setBookingsList] = useState<any[]>([])
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState<'accept' | 'reject'>('accept')
  const [actionLoading, setActionLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [auth, setAuth] = useState<{ fullName?: string; uniqueUserCode?: string } | null>(null)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  
  // Worker profile and skills state
  const [workerProfile, setWorkerProfile] = useState<any>(null)
  const [newSkill, setNewSkill] = useState('')

  // Get pending bookings
  const pendingBookings = bookingsList.filter(b => b.status === 'PENDING')

  const fetchBookings = () => {
    getBookingsStats('worker').then(r => setStats(r.data)).catch(() => {})
    getWorkerBookings().then(r => {
      const data = r.data as any[]
      setBookingsList(data)
      const mapped = data.map(b => ({
        id: b.id,
        title: `${b.client?.fullName || 'Client'}${b.status ? ` (${b.status})` : ''}`,
        start: b.startDateTime,
        end: b.endDateTime,
        status: b.status,
        cancellationReason: b.cancellationReason,
        clientId: b.client?.id,
        workerId: b.worker?.user?.id,
        client: b.client,
        location: b.location,
        description: b.description,
      }))
      setEvents(mapped)
    }).catch(() => {})
  }

  const fetchWorkerProfile = async () => {
    try {
      const profile = await getMyWorkerProfile()
      setWorkerProfile(profile)
    } catch (error) {
      console.error('Failed to fetch worker profile:', error)
    }
  }

  const handleAddSkill = async () => {
    if (!newSkill.trim() || !workerProfile?.id) return
    
    try {
      const response = await addWorkerSkill(workerProfile.id, newSkill.trim())
      setWorkerProfile(response.data)
      setNewSkill('')
      toast.success('Skill added successfully')
    } catch (error: any) {
      toast.error(error?.response?.data || 'Failed to add skill')
    }
  }

  const handleRemoveSkill = async (skill: string) => {
    if (!workerProfile?.id) return
    
    try {
      const response = await removeWorkerSkill(workerProfile.id, skill)
      setWorkerProfile(response.data)
      toast.success('Skill removed')
    } catch (error: any) {
      toast.error(error?.response?.data || 'Failed to remove skill')
    }
  }

  const handleAccept = async (reason?: string) => {
    if (!selectedBooking?.id) return
    
    setActionLoading(true)
    try {
      await acceptBooking(selectedBooking.id)
      toast.success('Booking accepted successfully!')
      setShowActionModal(false)
      setSelectedBooking(null)
      fetchBookings() // Refresh bookings
    } catch (error: any) {
      toast.error(error?.response?.data || 'Failed to accept booking')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (reason?: string) => {
    if (!selectedBooking?.id || !reason) return
    
    setActionLoading(true)
    try {
      await rejectBooking(selectedBooking.id, reason)
      toast.success('Booking rejected')
      setShowActionModal(false)
      setSelectedBooking(null)
      fetchBookings() // Refresh bookings
    } catch (error: any) {
      toast.error(error?.response?.data || 'Failed to reject booking')
    } finally {
      setActionLoading(false)
    }
  }

  const openActionModal = (booking: any, action: 'accept' | 'reject') => {
    setSelectedBooking(booking)
    setActionType(action)
    setShowActionModal(true)
  }

  useEffect(() => {
    try {
      const stored = localStorage.getItem('auth')
      if (stored) setAuth(JSON.parse(stored))
    } catch {}
    fetchBookings()
    fetchWorkerProfile()
  }, [])

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
            Worker Dashboard{auth?.fullName ? ` - ${auth.fullName}` : ''}
          </h1>
          <p className="text-[#475569] mt-2 text-lg">Manage your bookings and client requests</p>
          {auth?.uniqueUserCode && (
            <div className="inline-flex items-center space-x-1 bg-purple-50 px-4 py-2 rounded-xl text-sm text-purple-700 font-medium mt-3 border border-purple-100">
              <span>Worker ID:</span>
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
              subtitle={`Client: ${stats?.cancelledByClient ?? 0} | Rejected: ${stats?.cancelledByWorker ?? 0}`}
              icon={<XCircle size={24} />}
              color="red"
            />
          </motion.div>

          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <Link to="/dashboard/skills">
              <div className="card group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-600 to-indigo-600 text-white border-none h-full cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white/90 mb-1">Manage Skills</p>
                    <p className="text-3xl font-bold text-white mb-2">→</p>
                    <div className="text-xs font-medium bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-all inline-block">
                      Go to Skill Section
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/20 group-hover:scale-110 transition-transform">
                    <Tag className="text-white" size={24} />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </motion.div>

        {/* PENDING Booking Requests - Prominent Section */}
        {pendingBookings.length > 0 && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center animate-pulse">
                  <AlertCircle size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">Incoming Booking Requests</h2>
                  <p className="text-sm text-gray-600 mt-0.5">
                    You have <span className="font-bold text-amber-700">{pendingBookings.length}</span> pending {pendingBookings.length === 1 ? 'request' : 'requests'} waiting for your response
                  </p>
                </div>
                <div className="px-4 py-2 bg-amber-500 text-white rounded-full font-bold text-lg">
                  {pendingBookings.length}
                </div>
              </div>

              <div className="space-y-4">
                {pendingBookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    className="bg-white rounded-xl p-5 shadow-md border border-amber-200 hover:shadow-lg transition-all"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Client Info */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          {(booking.client?.fullName || 'C')[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 text-lg">{booking.client?.fullName || 'Client'}</h3>
                            {booking.client?.uniqueUserCode && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-mono font-semibold">
                                {booking.client.uniqueUserCode}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 font-medium">{booking.description || 'Service Request'}</p>
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
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => openActionModal(booking, 'accept')}
                          className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                        >
                          <CheckCircle size={18} />
                          Accept
                        </button>
                        <button
                          onClick={() => openActionModal(booking, 'reject')}
                          className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                        >
                          <XCircle size={18} />
                          Reject
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Skills Section */}
        <motion.div 
          className="card mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Tag size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1e293b]">Your Skills</h3>
              <p className="text-sm text-[#475569]">Showcase your expertise</p>
            </div>
          </div>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              placeholder="e.g., JavaScript, React, Node.js"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              onClick={handleAddSkill}
              disabled={!newSkill.trim()}
              className="btn-primary px-4 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {workerProfile?.skills && workerProfile.skills.length > 0 ? (
              workerProfile.skills.map((skill: string, idx: number) => (
                <span 
                  key={idx}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No skills added yet. Add your first skill above!</p>
            )}
          </div>
        </motion.div>

        {/* Bookings Section */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#1e293b]">Your Schedule</h2>
              <p className="text-sm text-[#475569] mt-1">View and manage client bookings</p>
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
                  client: ext?.client,
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
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
                        No bookings yet
                      </td>
                    </tr>
                  ) : (
                    bookingsList.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                              {(booking.client?.fullName || 'C')[0]}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{booking.client?.fullName || 'Client'}</div>
                              <div className="text-sm text-gray-500">ID: {booking.client?.uniqueUserCode || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {booking.description ? (
                            <div>
                              <div className="font-medium text-gray-900 truncate max-w-xs">{booking.description}</div>
                            </div>
                          ) : (
                            <div className="text-gray-500">Service Request</div>
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
                            {booking.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={async () => {
                                    try {
                                      await acceptBooking(booking.id)
                                      toast.success('Booking accepted successfully')
                                      fetchBookings()
                                    } catch (error: any) {
                                      toast.error(error?.response?.data || 'Failed to accept booking')
                                    }
                                  }}
                                  className="btn-icon-sm bg-green-50 text-green-600 hover:bg-green-100"
                                  title="Accept Booking"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedBooking(booking)
                                    setShowReject(true)
                                  }}
                                  className="btn-icon-sm bg-red-50 text-red-600 hover:bg-red-100"
                                  title="Reject Booking"
                                >
                                  <Ban size={16} />
                                </button>
                              </>
                            )}
                            {(booking.status === 'ACCEPTED' || booking.status === 'CONFIRMED') && (
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking)
                                  setShowReject(true)
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
          isOpen={showReject}
          title="Reject Booking"
          onCancel={() => setShowReject(false)}
          onSubmit={async (reason) => {
            try {
              await rejectBooking(selectedBooking?.id, reason)
              toast.success('Booking rejected')
              setShowReject(false)
              fetchBookings()
            } catch (error: any) {
              toast.error(error?.response?.data || 'Failed to reject booking')
            }
          }}
        />

        <BookingActionModal
          isOpen={showActionModal}
          booking={selectedBooking}
          action={actionType}
          onClose={() => {
            setShowActionModal(false)
            setSelectedBooking(null)
          }}
          onConfirm={actionType === 'accept' ? handleAccept : handleReject}
          isLoading={actionLoading}
        />
      </main>
    </div>
  )
}
