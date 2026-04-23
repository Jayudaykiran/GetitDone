import { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import { getWorker } from '../services/workerService'
import { createBooking } from '@/services/api'
import BookingModal from '@/components/BookingModal'
import { Briefcase, MapPin, Clock, DollarSign, CheckCircle, Star, Award, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

export default function WorkerProfile() {
  const { id } = useParams()
  const location = useLocation()
  const [worker, setWorker] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    getWorker(id).then(w => setWorker(w)).finally(() => setLoading(false))
    
    // Auto-open booking modal if navigated from "Book Now"
    if (location.state?.openBooking) {
      setOpen(true)
    }
  }, [id, location])

  const handleConfirm = async (startISO: string, endISO: string, description?: string) => {
    if (!id) return
    try {
      await createBooking({ 
        workerId: id, 
        startDateTime: startISO, 
        endDateTime: endISO, 
        description, 
        location: 'Client location' 
      })
      toast.success('Booking requested successfully! Check your dashboard.')
      setOpen(false)
    } catch (e: any) {
      toast.error(e?.response?.data || 'Failed to request booking')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9fafb]">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="spinner-primary"></div>
        </div>
      </div>
    )
  }

  if (!worker) {
    return (
      <div className="min-h-screen bg-[#f9fafb]">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-[#1e293b] mb-2">Worker Not Found</h2>
          <p className="text-[#475569]">The worker profile you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Profile Header Card */}
          <div className="card mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-lg">
                  {worker.user?.fullName?.charAt(0) || 'W'}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-[#1e293b] mb-2">
                      {worker.user?.fullName || 'Unknown Worker'}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 text-[#475569]">
                        <Briefcase className="w-4 h-4" />
                        <span className="font-semibold">{worker.jobRole || 'General Worker'}</span>
                      </div>
                      {worker.verified && (
                        <div className="badge-success flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Verified</span>
                        </div>
                      )}
                      {worker.user?.uniqueUserCode && (
                        <div className="badge-info font-mono">
                          ID: {worker.user.uniqueUserCode}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Availability Badge */}
                  {worker.availability ? (
                    <span className="badge-success">Available Now</span>
                  ) : (
                    <span className="badge-danger">Currently Busy</span>
                  )}
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {worker.yearsExperience !== undefined && (
                    <div className="text-center p-3 bg-blue-50 rounded-xl">
                      <div className="flex items-center justify-center mb-1">
                        <Award className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-blue-600">{worker.yearsExperience}</div>
                      <div className="text-xs text-gray-600">Years Exp</div>
                    </div>
                  )}
                  
                  {worker.rate && (
                    <div className="text-center p-3 bg-green-50 rounded-xl">
                      <div className="text-2xl font-bold text-green-600">₹{worker.rate}</div>
                      <div className="text-xs text-gray-600">Per {worker.pricingType === 'PER_HOUR' ? 'Hour' : 'Day'}</div>
                    </div>
                  )}

                  <div className="text-center p-3 bg-purple-50 rounded-xl">
                    <div className="flex items-center justify-center mb-1">
                      <Star className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-purple-600">4.8</div>
                    <div className="text-xs text-gray-600">Rating</div>
                  </div>

                  <div className="text-center p-3 bg-orange-50 rounded-xl">
                    <div className="flex items-center justify-center mb-1">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold text-orange-600">150+</div>
                    <div className="text-xs text-gray-600">Jobs Done</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* About */}
            <div className="md:col-span-2 card">
              <h2 className="text-xl font-bold text-[#1e293b] mb-4">About</h2>
              <p className="text-[#475569] leading-relaxed">
                {worker.bio || 'No bio provided yet.'}
              </p>

              {worker.subtype && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-[#1e293b] mb-2">Specialization</h3>
                  <span className="badge-purple">{worker.subtype}</span>
                </div>
              )}

              {worker.workType && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-[#1e293b] mb-2">Work Type</h3>
                  <div className="flex items-center gap-2 text-[#475569]">
                    <MapPin className="w-4 h-4" />
                    <span>{worker.workType}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-xl font-bold text-[#1e293b] mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button 
                  className="btn-primary w-full"
                  onClick={() => setOpen(true)}
                  disabled={!worker.availability}
                >
                  {worker.availability ? 'Request Booking' : 'Currently Unavailable'}
                </button>
                
                <button className="btn-secondary w-full">
                  Send Message
                </button>
                
                <button className="btn-outline w-full">
                  View Reviews
                </button>
              </div>

              {/* Contact Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-[#1e293b] mb-3">Contact</h3>
                <div className="space-y-2 text-sm text-[#475569]">
                  {worker.user?.email && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Email:</span>
                      <span className="font-medium">{worker.user.email}</span>
                    </div>
                  )}
                  {worker.user?.phone && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Phone:</span>
                      <span className="font-medium">{worker.user.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <BookingModal 
          isOpen={open} 
          onClose={() => setOpen(false)} 
          onConfirm={handleConfirm} 
        />
      </main>
    </div>
  )
}
