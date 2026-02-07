import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const { token } = JSON.parse(user);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage:', error);
      // Don't remove user here - let AuthContext handle it
    }
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Temporarily disabled to debug auth issues
    // if (error.response?.status === 401) {
    //   localStorage.removeItem('user');
    //   window.location.href = '/login';
    // }
    return Promise.reject(error);
  }
);

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

// Calendar, Heatmap, Timeline
export const getCalendarData = (year, month) => api.get(`/entries/calendar?year=${year}&month=${month}`);
export const getMoodHeatmap = (year) => api.get(`/entries/heatmap?year=${year}`);
export const getTimeline = (page = 1, limit = 20) => api.get(`/entries/timeline?page=${page}&limit=${limit}`);

// Pin entries
export const togglePin = (id) => api.put(`/entries/${id}/pin`);

// Location
export const updateLocation = (id, location) => api.put(`/entries/${id}/location`, location);

// Reflection questions
export const generateReflectionQuestions = (id) => api.post(`/entries/${id}/reflect`);

// Images
export const addImage = (id, imageUrl) => api.post(`/entries/${id}/images`, { imageUrl });
export const removeImage = (id, imageUrl) => api.delete(`/entries/${id}/images`, { data: { imageUrl } });

// Audio
export const updateAudio = (id, audioUrl) => api.put(`/entries/${id}/audio`, { audioUrl });

// Spotify
export const saveSpotifyTrack = (id, track) => api.put(`/entries/${id}/spotify`, track);

// User/Auth endpoints
export const getProfile = () => api.get('/auth/profile');
export const updateSettings = (settings) => api.put('/auth/settings', settings);
export const getCustomTags = () => api.get('/auth/tags');
export const addCustomTag = (tag) => api.post('/auth/tags', { tag });
export const deleteCustomTag = (tag) => api.delete(`/auth/tags/${encodeURIComponent(tag)}`);
export const exportUserData = () => api.get('/auth/export');

// Reminders
export const getReminders = () => api.get('/auth/reminders');
export const updateReminders = (settings) => api.put('/auth/reminders', settings);

// PIN lock
export const getPinStatus = () => api.get('/auth/pin/status');
export const setPin = (pin, biometricEnabled) => api.post('/auth/pin', { pin, biometricEnabled });
export const verifyPin = (pin) => api.post('/auth/pin/verify', { pin });
export const disablePin = (pin) => api.delete('/auth/pin', { data: { pin } });

export default api;
