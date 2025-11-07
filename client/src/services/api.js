import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  createGuest: (name) => api.post('/auth/guest', { name }),
  convertGuest: (data) => api.post('/auth/convert-guest', data),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
};

// Task APIs
export const taskAPI = {
  getTasks: (params) => api.get('/tasks', { params }),
  getTask: (id) => api.get(`/tasks/${id}`),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.patch(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  updateProgress: (id, progress) => api.patch(`/tasks/${id}/progress`, { progress }),
  changeStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  extendDeadline: (id, data) => api.post(`/tasks/${id}/extend-deadline`, data),
  addSubTask: (id, text) => api.post(`/tasks/${id}/subtasks`, { text }),
  completeSubTask: (id, subtaskId) => api.patch(`/tasks/${id}/subtasks/${subtaskId}/complete`),
  addComment: (id, text) => api.post(`/tasks/${id}/comments`, { text }),
  deleteComment: (taskId, commentId) => api.delete(`/tasks/${taskId}/comments/${commentId}`),
  getCategories: () => api.get('/tasks/categories'),
  getOverdueTasks: () => api.get('/tasks/overdue')
};

// File APIs
export const fileAPI = {
  upload: (formData) => api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getTaskFiles: (taskId) => api.get(`/files/task/${taskId}`),
  download: (id) => api.get(`/files/${id}`, { responseType: 'blob' }),
  deleteFile: (id) => api.delete(`/files/${id}`)
};

// Sharing APIs
export const shareAPI = {
  createShareLink: (data) => api.post('/share/create', data),
  getShareLink: (taskId) => api.get(`/share/task/${taskId}`),
  getSharedTask: (token) => api.get(`/share/${token}`),
  inviteUsers: (data) => api.post('/share/invite', data),
  deactivateLink: (token) => api.delete(`/share/${token}`)
};

// Admin APIs
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  changeUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  suspendUser: (id) => api.patch(`/admin/users/${id}/suspend`),
  activateUser: (id) => api.patch(`/admin/users/${id}/activate`),
  getTasks: (params) => api.get('/admin/tasks', { params }),
  archiveTask: (id) => api.patch(`/admin/tasks/${id}/archive`),
  getActivityLogs: (params) => api.get('/admin/activity-logs', { params }),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  getStats: () => api.get('/admin/stats')
};

export default api;