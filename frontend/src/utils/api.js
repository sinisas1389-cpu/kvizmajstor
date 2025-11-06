import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  signup: async (email, username, password) => {
    const response = await api.post('/auth/signup', { email, username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
};

// Quizzes API
export const quizzesAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/quizzes', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/quizzes/${id}`);
    return response.data;
  },
  
  getQuestions: async (id) => {
    const response = await api.get(`/quizzes/${id}/questions`);
    return response.data;
  },
  
  getForEdit: async (id) => {
    const response = await api.get(`/quizzes/${id}/edit`);
    return response.data;
  },
  
  create: async (quizData) => {
    const response = await api.post('/quizzes', quizData);
    return response.data;
  },
  
  update: async (id, quizData) => {
    const response = await api.put(`/quizzes/${id}`, quizData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/quizzes/${id}`);
    return response.data;
  },
  
  submit: async (id, answers) => {
    const response = await api.post(`/quizzes/${id}/submit`, { answers });
    return response.data;
  },
};

// Leaderboard API
export const leaderboardAPI = {
  get: async () => {
    const response = await api.get('/leaderboard');
    return response.data;
  },
};

// User API
export const userAPI = {
  getProgress: async () => {
    const response = await api.get('/users/progress');
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  
  toggleCreatorStatus: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/creator`);
    return response.data;
  },
  
  createCategory: async (categoryData) => {
    const response = await api.post('/admin/categories', categoryData);
    return response.data;
  },
  
  deleteCategory: async (categoryId) => {
    const response = await api.delete(`/admin/categories/${categoryId}`);
    return response.data;
  },
};

export default api;
