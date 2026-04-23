export const cancelBooking = (bookingId: string, reason: string) =>
  api.put(`/bookings/${bookingId}/cancel`, { reason });

export const rejectBooking = (bookingId: string, reason: string) =>
  api.put(`/bookings/${bookingId}/reject`, { reason });
import api from './api';

export async function requestBooking(payload: any) {
  const res = await api.post('/bookings', payload);
  return res.data;
}

export async function acceptBooking(id: string) {
  const res = await api.put(`/bookings/${id}/accept`);
  return res.data;
}
