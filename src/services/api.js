import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000/api',
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
export const registerUser = (data) => API.post('/auth/register', data);
export const fetchCurrentUser = () => API.get('/auth/me');

// Sync & Health
export const syncData = () => API.post('/sync');
export const fetchHealth = () => API.get('/health');

// Students
export const fetchStudents = (params) => API.get('/students', { params });
export const fetchStudentById = (id) => API.get(`/students/${id}`);

// Companies
export const fetchCompanies = () => API.get('/companies');
export const fetchCompanyById = (id) => API.get(`/companies/${id}`);
export const createCompany = (data) => API.post('/companies', data);
export const updateCompany = (id, data) => API.patch(`/companies/${id}`, data);
export const deleteCompany = (id) => API.delete(`/companies/${id}`);

// Drives
export const fetchDrives = (params) => API.get('/drives', { params });
export const fetchDriveById = (id) => API.get(`/drives/${id}`);
export const createDrive = (data) => API.post('/drives', data);
export const updateDrive = (id, data) => API.patch(`/drives/${id}`, data);
export const deleteDrive = (id) => API.delete(`/drives/${id}`);

// Applications
export const fetchApplications = (params) => API.get('/applications', { params });
export const fetchApplicationById = (id) => API.get(`/applications/${id}`);
export const createApplication = (data) => API.post('/applications', data);
export const updateApplication = (id, data) => API.patch(`/applications/${id}`, data);
export const deleteApplication = (id) => API.delete(`/applications/${id}`);

// Interviews
export const fetchInterviews = () => API.get('/interviews');
export const scheduleInterview = (data) => API.post('/interviews', data);
export const updateInterviewResult = (id, data) => API.patch(`/interviews/${id}`, data);

// Analytics
export const fetchPlacementAnalytics = () => API.get('/analytics/placements');
export const fetchDepartmentAnalytics = () => API.get('/analytics/departments');
export const fetchCompanyAnalytics = () => API.get('/analytics/companies');

export default API;
