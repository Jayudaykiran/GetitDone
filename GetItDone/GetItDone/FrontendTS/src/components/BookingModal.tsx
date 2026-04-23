import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, MapPin, CreditCard } from 'lucide-react'

type Props = {
  isOpen: boolean
  onClose: () => void
  onConfirm: (date: string, startTime: string, endTime: string, paymentMode: string, location?: string) => void
  worker?: any
}

export default function BookingModal({ isOpen, onClose, onConfirm, worker }: Props) {
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [paymentMode, setPaymentMode] = useState('')
  const [location, setLocation] = useState('')

  const isOfflineWorker = worker?.workType?.toLowerCase() === 'offline' || 
                          worker?.workType?.toLowerCase() === 'both'
  const isOnlineOnly = worker?.workType?.toLowerCase() === 'online'

  // Helper to format date as dd/mm/yyyy
  const formatDateToDDMMYYYY = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Helper to convert dd/mm/yyyy to yyyy-mm-dd for input
  const convertToInputFormat = (ddmmyyyy: string): string => {
    if (!ddmmyyyy) return '';
    const parts = ddmmyyyy.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return ddmmyyyy;
  }

  const setToday = () => {
    const today = new Date();
    const formatted = today.toISOString().split('T')[0];
    setDate(formatted);
  }

  const setTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formatted = tomorrow.toISOString().split('T')[0];
    setDate(formatted);
  }

  const confirm = () => {
    if (!date || !startTime || !endTime || !paymentMode) {
      alert('Please fill in all required fields');
      return;
    }
    if (!isOnlineOnly && isOfflineWorker && !location.trim()) {
      alert('Location is required for offline/skilled workers');
      return;
    }
    
    onConfirm(date, startTime, endTime, paymentMode, location || undefined);
    
    // Reset form
    setDate('');
    setStartTime('');
    setEndTime('');
    setPaymentMode('');
    setLocation('');
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div 
              className="modal-content max-w-lg"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-[#1e293b]">Create Booking</h3>
                  {worker && (
                    <p className="text-sm text-gray-600 mt-1">
                      Booking with <span className="font-semibold text-blue-600">{worker.user?.fullName || 'Worker'}</span>
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-5">
                {/* Date */}
                <div>
                  <label className="form-label flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#2563eb]" />
                    Booking Date *
                  </label>
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      onClick={setToday}
                      className="btn-outline text-xs px-3 py-1.5 flex-1"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={setTomorrow}
                      className="btn-outline text-xs px-3 py-1.5 flex-1"
                    >
                      Tomorrow
                    </button>
                  </div>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)} 
                    className="input-field w-full" 
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {date && (
                    <p className="text-xs text-gray-500 mt-1">
                      Selected: {formatDateToDDMMYYYY(new Date(date))}
                    </p>
                  )}
                </div>

                {/* Time Range */}
                <div>
                  <label className="form-label flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#2563eb]" />
                    Time Range *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Start Time</label>
                      <input 
                        type="time" 
                        value={startTime} 
                        onChange={e => setStartTime(e.target.value)} 
                        className="input-field w-full" 
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">End Time</label>
                      <input 
                        type="time" 
                        value={endTime} 
                        onChange={e => setEndTime(e.target.value)} 
                        className="input-field w-full" 
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Mode */}
                <div>
                  <label className="form-label flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#2563eb]" />
                    Payment Mode *
                  </label>
                  <select
                    value={paymentMode}
                    onChange={e => setPaymentMode(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Select payment mode</option>
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>

                {/* Location (required for offline workers, hidden for online-only) */}
                {!isOnlineOnly && (
                  <div>
                    <label className="form-label flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#2563eb]" />
                      Service Location {isOfflineWorker && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="Enter the service location address"
                      className="input-field w-full"
                      required={isOfflineWorker}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {isOfflineWorker ? 'Required for offline/skilled workers' : 'Optional - where the service will be provided'}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button 
                  className="btn-secondary flex-1" 
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary flex-1" 
                  onClick={confirm}
                  disabled={!date || !startTime || !endTime || !paymentMode || (!isOnlineOnly && isOfflineWorker && !location.trim())}
                >
                  Confirm Booking
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}


