import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getApplications = () => api.get('/applications');
export const getStats = () => api.get('/stats');
export const createApplication = (application) => api.post('/applications', application);
export const updateApplication = (id, application) => api.put(`/applications/${id}`, application);
export const deleteApplication = (id) => api.delete(`/applications/${id}`);

export const getApiErrorMessage = (error, fallback = 'Something went wrong. Please try again.') =>
  error.response?.data?.message || fallback;

export default api;
