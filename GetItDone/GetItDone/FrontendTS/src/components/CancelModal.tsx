import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function CancelModal({ 
  isOpen, 
  title = 'Provide reason', 
  onCancel, 
  onSubmit 
}: { 
  isOpen: boolean
  title?: string
  onCancel: () => void
  onSubmit: (reason: string) => void 
}) {
  const [reason, setReason] = useState('')
  
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
            onClick={onCancel}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div 
              className="modal-content"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#1e293b]">{title}</h3>
                <button
                  onClick={onCancel}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="mb-6">
                <label className="form-label">Reason for cancellation</label>
                <textarea 
                  className="textarea-field w-full min-h-[120px]" 
                  value={reason} 
                  onChange={e => setReason(e.target.value)} 
                  placeholder="Please provide a detailed reason for cancellation..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button 
                  className="btn-secondary flex-1" 
                  onClick={onCancel}
                >
                  Cancel
                </button>
                <button 
                  className="btn-danger flex-1" 
                  onClick={() => {
                    onSubmit(reason)
                    setReason('')
                  }} 
                  disabled={!reason.trim()}
                >
                  Submit
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}


