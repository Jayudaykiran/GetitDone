import { useState } from 'react'
import CancelModal from './CancelModal'
import { cancelBooking, rejectBooking } from '../services/bookingService'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function BookingDetailsModal({ isOpen, booking, onClose, onAction }: { isOpen: boolean; booking: any; onClose: () => void; onAction?: () => void }) {
  const { user } = useAuth();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [actionType, setActionType] = useState<'cancel' | 'reject' | null>(null);
  if (!isOpen || !booking) return null;

  const isClient = user && booking && booking.clientId === user.userId;
  const isWorker = user && booking && booking.workerId === user.userId;
  const canCancel = isClient && ['PENDING', 'CONFIRMED', 'ACCEPTED'].includes(booking.status);
  const canReject = isWorker && ['PENDING', 'CONFIRMED', 'ACCEPTED'].includes(booking.status);

  const handleAction = (type: 'cancel' | 'reject') => {
    setActionType(type);
    setShowCancelModal(true);
  };

  const handleSubmitReason = async (reason: string) => {
    try {
      if (actionType === 'cancel') {
        await cancelBooking(booking.id, reason);
        toast.success('Booking cancelled successfully');
      } else if (actionType === 'reject') {
        await rejectBooking(booking.id, reason);
        toast.success('Booking rejected successfully');
      }
      setShowCancelModal(false);
      onClose();
      if (onAction) onAction();
    } catch (e: any) {
      toast.error(e?.response?.data || 'Failed to update booking');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 text-gray-700">
        <h3 className="text-lg font-semibold mb-3">Booking Details</h3>
        <div className="mb-2"><b>Title:</b> {booking.title}</div>
        <div className="mb-2"><b>Status:</b> {booking.status}</div>
        <div className="mb-2">
          <b>Start:</b>{" "}
          {new Date(booking.startDateTime).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}{" "}
          at{" "}
          {new Date(booking.startDateTime).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </div>
        <div className="mb-2">
          <b>End:</b>{" "}
          {new Date(booking.endDateTime).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}{" "}
          at{" "}
          {new Date(booking.endDateTime).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </div>
        {booking.cancellationReason && (
          <div className="mb-2 text-red-600"><b>Reason:</b> {booking.cancellationReason}</div>
        )}
        <div className="flex justify-end gap-2 mt-4">
          {canCancel && (
            <button className="bg-red-600 text-white rounded px-4 py-2 mr-2" onClick={() => handleAction('cancel')}>Cancel Booking</button>
          )}
          {canReject && (
            <button className="bg-red-600 text-white rounded px-4 py-2 mr-2" onClick={() => handleAction('reject')}>Reject Booking</button>
          )}
          <button className="bg-gray-400 text-white rounded px-4 py-2" onClick={onClose}>Close</button>
        </div>
        <CancelModal
          isOpen={showCancelModal}
          title={actionType === 'cancel' ? 'Reason for cancellation' : 'Reason for rejection'}
          onCancel={() => setShowCancelModal(false)}
          onSubmit={handleSubmitReason}
        />
      </div>
    </div>
  );
}
