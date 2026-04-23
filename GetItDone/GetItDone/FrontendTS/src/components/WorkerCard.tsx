import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiBriefcase, FiMapPin, FiClock, FiCheck, FiTag, FiGlobe, FiLinkedin, FiExternalLink, FiArrowRight } from 'react-icons/fi'
import BookingModal from './BookingModal'
import { createBooking } from '@/services/api'
import toast from 'react-hot-toast'

export default function WorkerCard({ worker }: { worker: any }) {
  console.log('[WorkerCard] ===== RENDERING WORKER CARD =====');
  console.log('[WorkerCard] Full worker object:', JSON.stringify(worker, null, 2));
  console.log('[WorkerCard] Worker ID:', worker?.id);
  console.log('[WorkerCard] Worker user:', worker?.user);
  console.log('[WorkerCard] Worker user fullName:', worker?.user?.fullName);
  console.log('[WorkerCard] Worker jobRole:', worker?.jobRole);
  
  if (!worker) {
    console.error('[WorkerCard] Worker is null or undefined!');
    return <div className="card p-4 text-red-600">Error: Worker data is missing</div>;
  }
  
  const navigate = useNavigate()
  const [showBookingModal, setShowBookingModal] = useState(false)

  const handleViewProfile = () => {
    navigate(`/workers/${worker.id}`)
  }

  const handleBookWorker = () => {
    setShowBookingModal(true)
  }

  const isProfessional = worker.subtype?.toLowerCase() === 'professional'
  const isEveryday = worker.subtype?.toLowerCase() === 'everyday' || worker.subtype?.toLowerCase() === 'skilled'

  const handleConfirmBooking = async (date: string, startTime: string, endTime: string, paymentMode: string, location?: string) => {
    try {
      // Create ISO datetime strings
      const startISO = new Date(`${date}T${startTime}:00`).toISOString();
      const endISO = new Date(`${date}T${endTime}:00`).toISOString();
      
      console.log('[WorkerCard] Creating booking:', {
        workerId: worker.id,
        startISO,
        endISO,
        paymentMode,
        location
      });
      
      await createBooking({
        workerId: worker.id,
        startDateTime: startISO,
        endDateTime: endISO,
        location: location || '',
        description: `Booking for ${worker.jobRole || 'service'} - Payment: ${paymentMode}`
      });
      
      toast.success('Booking request sent! Status: PENDING');
      setShowBookingModal(false);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err: any) {
      console.error('[WorkerCard] Booking error:', err);
      toast.error(err?.response?.data || 'Failed to create booking');
    }
  }

  return (
    <>
      <div className="card-hover group">
        <div className="flex items-start justify-between">
          {/* Worker Info */}
          <div className="flex items-start space-x-4 flex-1">
            {/* Avatar */}
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-lg">
              {worker.user?.fullName?.charAt(0) || 'W'}
            </div>

            {/* Details */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {worker.user?.fullName || 'Unknown Worker'}
                </h3>
                {worker.verified && (
                  <div className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full flex items-center space-x-1 text-xs">
                    <FiCheck size={12} />
                    <span>Verified</span>
                  </div>
                )}
              </div>

              {/* Worker ID */}
              {worker.user?.uniqueUserCode && (
                <div className="inline-flex items-center space-x-1 bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-1 rounded-lg text-sm font-mono mb-3 border border-blue-100">
                  <span className="text-gray-600">ID:</span>
                  <span className="font-semibold text-blue-700">{worker.user.uniqueUserCode}</span>
                </div>
              )}

              {/* Job Role */}
              <div className="flex items-center space-x-2 text-sm text-gray-700 mb-3 font-medium">
                <FiBriefcase size={16} className="text-blue-500" />
                <span className="font-semibold">{worker.jobRole || 'General Worker'}</span>
                {worker.subtype && (
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold">
                    {worker.subtype}
                  </span>
                )}
              </div>

              {/* Worker Details Grid */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                {/* Experience */}
                {worker.yearsExperience !== undefined && (
                  <div className="flex items-center space-x-2 text-sm">
                    <FiClock className="text-gray-400" size={16} />
                    <span className="text-gray-700 font-medium">{worker.yearsExperience} years exp</span>
                  </div>
                )}

                {/* Work Type */}
                {worker.workType && (
                  <div className="flex items-center space-x-2 text-sm">
                    <FiMapPin className="text-gray-400" size={16} />
                    <span className="text-gray-700 font-medium capitalize">{worker.workType}</span>
                  </div>
                )}

                {/* Pricing */}
                {worker.rate && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-900 font-bold">
                      ₹{worker.rate}/{worker.pricingType === 'PER_HOUR' ? 'hr' : worker.pricingType === 'PER_DAY' ? 'day' : 'project'}
                    </span>
                  </div>
                )}

                {/* Payment Mode */}
                {(worker.paymentUpi || worker.paymentBankAcc) && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-600 text-xs">Payment:</span>
                    <span className="text-gray-800 font-medium text-xs">
                      {worker.paymentUpi ? 'Online' : ''}{worker.paymentUpi && worker.paymentBankAcc ? '/' : ''}{worker.paymentBankAcc ? 'Offline' : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* Professional Workers - Tech Stack Highlighted */}
              {isProfessional && worker.skills && worker.skills.length > 0 && (
                <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <FiTag className="text-blue-600" size={14} />
                    <span className="text-xs font-bold text-blue-900">Tech Stack:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {worker.skills.slice(0, 8).map((skill: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 bg-white border border-blue-200 text-blue-800 text-xs rounded-lg font-semibold shadow-sm">
                        {skill}
                      </span>
                    ))}
                    {worker.skills.length > 8 && (
                      <span className="px-2 py-1 bg-white text-blue-600 text-xs rounded-lg font-bold">
                        +{worker.skills.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Professional - Portfolio & LinkedIn */}
              {isProfessional && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {worker.portfolioUrl && (
                    <a
                      href={worker.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      <FiGlobe size={14} />
                      <span>Portfolio</span>
                      <FiExternalLink size={12} />
                    </a>
                  )}
                  {worker.linkedinUrl && (
                    <a
                      href={worker.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      <FiLinkedin size={14} />
                      <span>LinkedIn</span>
                      <FiExternalLink size={12} />
                    </a>
                  )}
                </div>
              )}

              {/* Everyday Workers - Show skills */}
              {isEveryday && worker.skills && worker.skills.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <FiTag className="text-gray-400" size={14} />
                    <span className="text-xs font-semibold text-gray-600">Skills:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {worker.skills.slice(0, 5).map((skill: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                        {skill}
                      </span>
                    ))}
                    {worker.skills.length > 5 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{worker.skills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Work Categories */}
              {worker.workCategories && worker.workCategories.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <FiTag className="text-gray-400" size={14} />
                    <span className="text-xs font-semibold text-gray-600">Categories:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {worker.workCategories.slice(0, 3).map((cat: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full font-medium">
                        {cat}
                      </span>
                    ))}
                    {worker.workCategories.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{worker.workCategories.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Location (for offline workers) */}
              {(worker.workType === 'Offline' || worker.workType === 'offline' || worker.workType === 'Both' || worker.workType === 'both') && worker.user?.address && (
                <div className="mt-3 flex items-start space-x-2 text-sm">
                  <FiMapPin className="text-gray-400 mt-0.5" size={14} />
                  <span className="text-gray-600">{worker.user.address}</span>
                </div>
              )}

              {/* Bio */}
              {worker.bio && (
                <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                  {worker.bio}
                </p>
              )}
            </div>
          </div>

          {/* Availability Badge */}
          <div className="flex-shrink-0 ml-4">
            {worker.availability ? (
              <span className="badge-success">Available</span>
            ) : (
              <span className="badge-danger">Busy</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={handleViewProfile}
            className="flex-1 btn-outline text-sm py-2.5"
          >
            View Profile
          </button>
          <button
            onClick={handleBookWorker}
            className="flex-1 btn-primary text-sm py-2.5 flex items-center justify-center gap-2"
            disabled={!worker.availability}
          >
            <span>Book Worker</span>
            <FiArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onConfirm={handleConfirmBooking}
        worker={worker}
      />
    </>
  )
}
