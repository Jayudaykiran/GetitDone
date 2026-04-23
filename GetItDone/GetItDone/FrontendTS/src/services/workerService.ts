import api, { type WorkerSearchRequest } from './api';

export async function searchWorkersAdvanced(body: WorkerSearchRequest) {
  console.log('[workerService] searchWorkersAdvanced called with:', body);
  try {
    // Use GET with query params instead of POST
    const params: any = {};
    if (body.jobTitle) params.jobTitle = body.jobTitle;
    if (body.name) params.name = body.name;
    if (body.userCode) params.userCode = body.userCode;
    
    // Extract date and time from datetime strings if provided
    if (body.startDateTime && body.endDateTime) {
      try {
        const startDate = new Date(body.startDateTime);
        const endDate = new Date(body.endDateTime);
        params.date = startDate.toISOString().split('T')[0];
        params.startTime = startDate.toTimeString().split(' ')[0].substring(0, 5);
        params.endTime = endDate.toTimeString().split(' ')[0].substring(0, 5);
      } catch (e) {
        console.error('[workerService] Error parsing datetime:', e);
      }
    }
    
    console.log('[workerService] GET params:', params);
    const res = await api.get('/workers/search', { params });
    console.log('[workerService] API response:', res);
    console.log('[workerService] Response data:', res.data);
    console.log('[workerService] Response structure:', {
      count: res.data.count,
      workersIsArray: Array.isArray(res.data.workers),
      workersLength: res.data.workers?.length
    });
    
    return res.data; // Returns {count, workers}
  } catch (error) {
    console.error('[workerService] Error in searchWorkersAdvanced:', error);
    throw error;
  }
}

export async function getWorker(id: string) {
  const res = await api.get(`/workers/${id}`);
  return res.data;
}

export async function getMyWorkerProfile() {
  // Get all workers and find the one matching current user
  const res = await api.get('/workers');
  const workers = res.data;
  const auth = JSON.parse(localStorage.getItem('auth') || '{}');
  const userId = auth.userId;
  
  if (!userId) return null;
  
  const myProfile = workers.find((w: any) => w.user?.id === userId);
  return myProfile || null;
}
