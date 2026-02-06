import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const user = localStorage.getItem('user');
  if (user) {
    const { token } = JSON.parse(user);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Entry API calls
export const getEntries = () => api.get('/entries');
export const getEntry = (id) => api.get(`/entries/${id}`);
export const createEntry = (data) => api.post('/entries', data);
export const updateEntry = (id, data) => api.put(`/entries/${id}`, data);
export const deleteEntry = (id) => api.delete(`/entries/${id}`);
export const replyToEntry = (id, message) => api.post(`/entries/${id}/reply`, { message });

// New feature endpoints
export const toggleFavorite = (id) => api.put(`/entries/${id}/favorite`);
export const updateEntryTags = (id, tags) => api.put(`/entries/${id}/tags`, { tags });
export const searchEntries = (query) => api.get(`/entries/search?q=${encodeURIComponent(query)}`);
export const getFavorites = () => api.get('/entries/favorites');
export const getOnThisDay = () => api.get('/entries/on-this-day');
export const getMoodAnalytics = (period = 'month') => api.get(`/entries/analytics/mood?period=${period}`);
export const getWritingStats = () => api.get('/entries/stats');
export const getWeeklySummary = () => api.get('/entries/summary/weekly');
export const getDailyPrompts = () => api.get('/entries/prompts');

// User/Auth endpoints
export const getProfile = () => api.get('/auth/profile');
export const updateSettings = (settings) => api.put('/auth/settings', settings);
export const getCustomTags = () => api.get('/auth/tags');
export const addCustomTag = (tag) => api.post('/auth/tags', { tag });
export const deleteCustomTag = (tag) => api.delete(`/auth/tags/${encodeURIComponent(tag)}`);
export const exportUserData = () => api.get('/auth/export');

export default api;
