import axios from 'axios';
/// <reference types="vite/client" />

// Use Vite's import.meta.env for API base URL
const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from localStorage automatically
api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('auth');
    if (stored) {
      const { token } = JSON.parse(stored);
      if (token && config.headers) {
        (config.headers as any)['Authorization'] = `Bearer ${token}`;
      }
    }
  } catch {}
  return config;
});

export function setAuthToken(token?: string) {
  if (token) (api.defaults.headers as any).common['Authorization'] = `Bearer ${token}`;
  else delete (api.defaults.headers as any).common['Authorization'];
}

// --- Auth ---
export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  role?: 'CLIENT' | 'WORKER' | string;
  jobTitle?: string;
  phone?: string;
  address?: string;
  aadhaarNo?: string;
  panNo?: string;
  upiId?: string;
  dob?: string; // ISO date
  documentImage?: File;
};

export const registerUser = (payload: RegisterPayload | FormData) => {
  // If payload is FormData, set appropriate headers
  if (payload instanceof FormData) {
    return api.post('/auth/register', payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
  return api.post('/auth/register', payload);
};

export const loginUserByEmail = (email: string, password: string) => api.post('/auth/login', { email, password });

// --- Workers search (new backend endpoint expects POST /workers/search) ---
export type WorkerSearchRequest = {
  jobTitle?: string;
  name?: string;
  userCode?: string;
  startDateTime?: string; // ISO
  endDateTime?: string; // ISO
};

export const searchWorkers = (body: WorkerSearchRequest) => api.post('/workers/search', body);

// Search by unique user code (26X format)
export const searchWorkerByCode = (userCode: string) => api.post('/workers/search', { userCode });

// --- Bookings ---
export type BookingRequestPayload = {
  workerId: string;
  startDateTime: string; // ISO
  endDateTime: string; // ISO
  location?: string;
  description?: string;
};

export const createBooking = (payload: BookingRequestPayload) => api.post('/bookings', payload);
export const acceptBooking = (bookingId: string) => api.put(`/bookings/${bookingId}/accept`);
export const rejectBooking = (bookingId: string, reason?: string) => api.put(`/bookings/${bookingId}/reject`, reason ? { reason } : {});
export const cancelBooking = (bookingId: string, reason: string) => api.put(`/bookings/${bookingId}/cancel`, { reason });
export const getClientBookings = () => api.get('/bookings/client');
export const getWorkerBookings = () => api.get('/bookings/worker');
export const getBookingsStats = (role?: 'client' | 'worker') => api.get('/bookings/stats', { params: role ? { role } : {} });

// --- Other helper endpoints ---
export const getWorkerById = (id: string) => api.get(`/workers/${id}`);

// --- Worker Skills & Categories Management ---
export const addWorkerSkill = (workerId: string, skill: string) => api.post(`/workers/${workerId}/skills`, { skill });
export const removeWorkerSkill = (workerId: string, skill: string) => api.delete(`/workers/${workerId}/skills/${encodeURIComponent(skill)}`);
export const addWorkerCategory = (workerId: string, category: string) => api.post(`/workers/${workerId}/categories`, { category });
export const removeWorkerCategory = (workerId: string, category: string) => api.delete(`/workers/${workerId}/categories/${encodeURIComponent(category)}`);

// Create Worker Profile
export const createWorkerProfile = (payload: {
  subtype: string
  jobRole: string
  yearsExperience?: number
  bio?: string
  workType?: string
  coverageRadiusKm?: number
  pricingType?: string
  rate?: number
  paymentUpi?: string
  paymentBankAcc?: string
  paymentIfsc?: string
}) => api.post('/workers', payload);

// Update Worker Profile
export const updateWorkerProfile = (workerId: string, payload: {
  subtype?: string
  jobRole?: string
  yearsExperience?: number
  bio?: string
  workType?: string
  coverageRadiusKm?: number
  pricingType?: string
  rate?: number
  paymentUpi?: string
  paymentBankAcc?: string
  paymentIfsc?: string
}) => api.put(`/workers/${workerId}`, payload);

// --- Client Service Preferences ---
export const getCurrentUser = () => api.get('/users/me');
export const addServicePreference = (preference: string) => api.post('/users/preferences', { preference });
export const removeServicePreference = (preference: string) => api.delete(`/users/preferences/${encodeURIComponent(preference)}`);
export const updateServicePreferences = (preferences: string[]) => api.put('/users/preferences', { preferences });

// --- Profile/Skills (compat helpers for existing pages) ---
export type RoleType = 'SERVICE_PROVIDER' | 'CLIENT'
export type WorkerType = 'PROFESSIONAL' | 'EVERYDAY'
export type SkillWorkerType = WorkerType
export type Availability = 'AVAILABLE' | 'BUSY'

type SaveUserDetailsPayload = {
  userId: number | string
  roleType: RoleType
  workerType?: WorkerType
  skills?: string
  experience?: number
  pricing?: string
  location?: string
  description?: string
}

// Maps to backend POST /api/workers to create a worker profile when SERVICE_PROVIDER.
export async function saveUserDetails(payload: SaveUserDetailsPayload) {
  if (payload.roleType !== 'SERVICE_PROVIDER') {
    return Promise.resolve({ data: { ok: true } })
  }
  const body = {
    subtype: payload.workerType === 'PROFESSIONAL' ? 'Professional' : 'Everyday',
    jobRole: payload.skills || 'General',
    yearsExperience: payload.experience ?? 0,
    bio: payload.description || '',
    workType: 'Offline',
    coverageRadiusKm: 10,
    pricingType: 'PER_HOUR',
    rate: payload.pricing ? Number(String(payload.pricing).replace(/[^0-9.]/g, '')) || 0 : 0,
    paymentUpi: '',
    paymentBankAcc: '',
    paymentIfsc: '',
    availability: true,
  }
  return api.post('/workers', body)
}

type AddSkillPayload = {
  userId: number | string
  roleType: RoleType
  workerType?: SkillWorkerType
  skills?: string
  experience?: number
  pricing?: string
  location?: string
  bio?: string
  availability?: Availability
}

export async function addSkill(payload: AddSkillPayload) {
  if (payload.roleType !== 'SERVICE_PROVIDER') {
    return Promise.resolve({ data: { ok: true } })
  }
  const body = {
    subtype: payload.workerType === 'PROFESSIONAL' ? 'Professional' : 'Everyday',
    jobRole: payload.skills || 'General',
    yearsExperience: payload.experience ?? 0,
    bio: payload.bio || '',
    workType: 'Offline',
    coverageRadiusKm: 10,
    pricingType: 'PER_HOUR',
    rate: payload.pricing ? Number(String(payload.pricing).replace(/[^0-9.]/g, '')) || 0 : 0,
    paymentUpi: '',
    paymentBankAcc: '',
    paymentIfsc: '',
    availability: payload.availability === 'AVAILABLE',
  }
  return api.post('/workers', body)
}

export default api;



