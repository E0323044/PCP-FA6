import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const loginUser = (credentials) => API.post('/auth/login', credentials);

// Sync
export const syncData = () => API.post('/sync');

// CRUD
export const fetchItems = (params) => API.get('/items', { params });
export const fetchItem = (id) => API.get(`/items/${id}`);
export const createItem = (data) => API.post('/items', data);
export const updateItem = (id, data) => API.put(`/items/${id}`, data);
export const deleteItem = (id) => API.delete(`/items/${id}`);

// Stats
export const fetchStats = () => API.get('/stats');

export default API;
