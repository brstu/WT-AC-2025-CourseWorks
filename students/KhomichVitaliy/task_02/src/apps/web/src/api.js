import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || 'Something went wrong';

    if (error.response?.status !== 401) {
      toast.error(message);
    }

    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const usersAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export const projectsAPI = {
  getProjects: (params) => api.get('/projects', { params }),
  getProject: (id) => api.get(`/projects/${id}`),
  createProject: (data) => api.post('/projects', data),
  updateProject: (id, data) => api.put(`/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/projects/${id}`),
};

export const issuesAPI = {
  getIssues: (params) => api.get('/issues', { params }),
  getIssue: (id) => api.get(`/issues/${id}`),
  createIssue: (data) => api.post('/issues', data),
  updateIssue: (id, data) => api.put(`/issues/${id}`, data),
  deleteIssue: (id) => api.delete(`/issues/${id}`),
  updateIssueStatus: (id, status) => 
    api.patch(`/issues/${id}/status`, { status }),
};

export const commentsAPI = {
  getComments: (issueId, params) => 
    api.get(`/comments/issues/${issueId}/comments`, { params }),
  createComment: (issueId, data) => 
    api.post(`/comments/issues/${issueId}/comments`, data),
  updateComment: (id, data) => api.put(`/comments/${id}`, data),
  deleteComment: (id) => api.delete(`/comments/${id}`),
};

export const labelsAPI = {
  getLabels: (params) => api.get('/labels', { params }),
  createLabel: (data) => api.post('/labels', data),
  deleteLabel: (id) => api.delete(`/labels/${id}`),
};

export const exportAPI = {
  exportIssues: (params) => 
    api.get('/issues/export', { 
      params,
      responseType: 'blob',
    }),
  importIssues: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/issues/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;