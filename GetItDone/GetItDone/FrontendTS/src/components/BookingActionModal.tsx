import { X, CheckCircle, XCircle } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BookingActionModalProps {
  isOpen: boolean
  onClose: () => void
  booking: any
  action: 'accept' | 'reject'
  onConfirm: (reason?: string) => void
  isLoading?: boolean
}

export default function BookingActionModal({ 
  isOpen, 
  onClose, 
  booking, 
  action,
  onConfirm,
  isLoading = false
}: BookingActionModalProps) {
  const [reason, setReason] = useState('')

  const handleConfirm = () => {
    if (action === 'reject' && !reason.trim()) {
      return
    }
    onConfirm(action === 'reject' ? reason : undefined)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              action === 'accept' 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50' 
                : 'bg-gradient-to-r from-red-50 to-rose-50'
            }`}>
              <div className="flex items-center gap-3">
                {action === 'accept' ? (
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle className="text-white" size={24} />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                    <XCircle className="text-white" size={24} />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {action === 'accept' ? 'Accept Booking' : 'Reject Booking'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {action === 'accept' 
                      ? 'Confirm this booking request' 
                      : 'Please provide a reason for rejection'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                disabled={isLoading}
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5 space-y-4">
              {/* Booking Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Client</p>
                    <p className="text-base font-semibold text-gray-900">{booking?.client?.fullName || 'Unknown'}</p>
                  </div>
                  {booking?.client?.uniqueUserCode && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-mono font-semibold">
                      {booking.client.uniqueUserCode}
                    </span>
                  )}
                </div>
                
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <p className="text-sm text-gray-500 font-medium">Service</p>
                  <p className="text-sm text-gray-900">{booking?.description || 'Service Request'}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-gray-200 pt-2 mt-2">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Date</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {booking?.startDateTime && new Date(booking.startDateTime).toLocaleDateString('en-US', { 
                        month: 'short', day: 'numeric', year: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Time</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {booking?.startDateTime && new Date(booking.startDateTime).toLocaleTimeString('en-US', { 
                        hour: '2-digit', minute: '2-digit' 
                      })}
                      {' - '}
                      {booking?.endDateTime && new Date(booking.endDateTime).toLocaleTimeString('en-US', { 
                        hour: '2-digit', minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>

                {booking?.location && (
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <p className="text-xs text-gray-500 font-medium">Location</p>
                    <p className="text-sm text-gray-900">{booking.location}</p>
                  </div>
                )}
              </div>

              {/* Reject Reason Input */}
              {action === 'reject' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please explain why you're rejecting this booking..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    rows={4}
                    disabled={isLoading}
                  />
                  {!reason.trim() && (
                    <p className="text-xs text-red-600 mt-1">
                      You must provide a reason to reject this booking
                    </p>
                  )}
                </div>
              )}

              {action === 'accept' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Note:</span> Accepting this booking will block your calendar for the specified time slot and mark it as CONFIRMED.
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading || (action === 'reject' && !reason.trim())}
                className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  action === 'accept'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                    : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : (
                  action === 'accept' ? 'Confirm & Accept' : 'Reject Booking'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
