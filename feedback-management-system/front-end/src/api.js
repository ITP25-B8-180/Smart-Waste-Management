import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token if needed
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Feedback API calls
export const feedbackAPI = {
  getAll: () => api.get('/feedbacks'),
  create: (feedbackData) => api.post('/feedbacks', feedbackData),
  addReply: (id, replyData) => api.post(`/feedbacks/${id}/reply`, replyData),
};

// Complaint API calls
export const complaintAPI = {
  getAll: (params) => api.get('/complaints', { params }),

  create: (complaintData) => {
    const formData = new FormData();
    Object.keys(complaintData).forEach((key) => {
      if (key === 'files') {
        Array.from(complaintData[key]).forEach((file) => {
          formData.append('files', file);
        });
      } else {
        formData.append(key, complaintData[key]);
      }
    });
    return api.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getById: (id) => api.get(`/complaints/${id}`),
  updateStatus: (id, status) => api.put(`/complaints/${id}/status`, { status }),
  updateNotes: (id, notes) => api.put(`/complaints/${id}/notes`, { notes }),
  delete: (id) => api.delete(`/complaints/${id}`),
};

export default api;
