import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE + '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// AI endpoints
export const extractProfile = (text, language) =>
  api.post('/ai/extract-profile', { text, language });

export const translateText = (text, targetLanguage) =>
  api.post('/ai/translate', { text, targetLanguage });

export const speakText = (text, language) =>
  api.post('/ai/speak', { text, language });

// Worker endpoints
export const registerWorker = (profile) =>
  api.post('/workers/register', { profile });

export const getWorker = (kaamId) =>
  api.get(`/workers/${kaamId}`);

// Scheme endpoints
export const matchSchemes = (kaamId, profile, country) =>
  api.post('/schemes/match', { kaamId, profile, country });

// Policy endpoints
export const getPolicyStats = () =>
  api.get('/policy/stats');

export const generateBrief = (filters) =>
  api.post('/policy/generate-brief', { filters });

export const getHeatmapData = (country, distressType) =>
  api.get('/policy/heatmap-data', { params: { country, distressType } });

export default api;
