import axios from 'axios';

// API Configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  timeout: 30000, // 30 seconds timeout for Vercel deployment
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling with retry logic
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error('API Error:', error);
    
    // Retry logic for network errors and timeouts
    if (!originalRequest._retry && 
        (error.code === 'ERR_NETWORK' || 
         error.code === 'ECONNABORTED' || 
         error.code === 'ERR_FAILED')) {
      
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      
      // Retry up to 3 times with exponential backoff
      if (originalRequest._retryCount <= 3) {
        const delay = Math.pow(2, originalRequest._retryCount) * 1000; // 2s, 4s, 8s
        console.log(`Retrying request in ${delay}ms (attempt ${originalRequest._retryCount}/3)`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return api(originalRequest);
      }
    }
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      console.error(`HTTP ${status}:`, data);
      
      if (status === 401) {
        // Handle unauthorized access
        console.error('Unauthorized access');
      } else if (status === 404) {
        console.error('Resource not found');
      } else if (status >= 500) {
        console.error('Server error');
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
    } else {
      // Something else happened
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
   }
 );

// Helper function to extract data from response
const extractData = (response) => response.data;

// Helper function to handle API calls with proper error handling
const handleApiCall = async (apiCall) => {
  try {
    const response = await apiCall();
    return extractData(response);
  } catch (error) {
    // If all retries failed, throw a user-friendly error
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      throw new Error('Unable to connect to server. Please check your internet connection and try again.');
    } else if (error.response) {
      throw new Error(error.response.data?.message || `Server error: ${error.response.status}`);
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

// API endpoints
export const apiService = {
  // Health check
  health: () => handleApiCall(() => api.get('/health')),
  
  // Locations
  locations: {
    getAll: () => handleApiCall(() => api.get('/locations')),
    getById: (id) => handleApiCall(() => api.get(`/locations/${id}`)),
    getNearby: (lat, lng, radius = 50) => 
      handleApiCall(() => api.get(`/locations/nearby?lat=${lat}&lng=${lng}&radius=${radius}`)),
    create: (data) => handleApiCall(() => api.post('/locations', data)),
    update: (id, data) => handleApiCall(() => api.put(`/locations/${id}`, data)),
    delete: (id) => handleApiCall(() => api.delete(`/locations/${id}`)),
  },

  // Water Quality
  waterQuality: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return handleApiCall(() => api.get(`/water-quality${queryString ? `?${queryString}` : ''}`));
    },
    getLatest: () => handleApiCall(() => api.get('/water-quality/latest')),
    getByLocation: (locationId, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return handleApiCall(() => api.get(`/water-quality/location/${locationId}${queryString ? `?${queryString}` : ''}`));
    },
    getTrends: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return handleApiCall(() => api.get(`/water-quality/trends${queryString ? `?${queryString}` : ''}`));
    },
    getCurrentAlerts: () => handleApiCall(() => api.get('/water-quality/alerts')),
    getCombined: (locationId) => handleApiCall(() => api.get(`/water-quality/combined/${locationId}`)),
    getCombinedAll: () => handleApiCall(() => api.get('/water-quality/combined')),
    create: (data) => handleApiCall(() => api.post('/water-quality', data)),
  },

  // Forecasts
  forecasts: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return handleApiCall(() => api.get(`/forecasts${queryString ? `?${queryString}` : ''}`));
    },
    getLatest: (locationId) => handleApiCall(() => api.get(`/forecasts/latest/${locationId}`)),
    getAllLocations: () => handleApiCall(() => api.get('/forecasts/all-locations')),
    generate: (locationId) => handleApiCall(() => api.post(`/forecasts/generate/${locationId}`)),
    generateAll: () => handleApiCall(() => api.post('/forecasts/generate-all')),
  },

  // Alerts
  alerts: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return handleApiCall(() => api.get(`/alerts${queryString ? `?${queryString}` : ''}`));
    },
    getSummary: () => handleApiCall(() => api.get('/alerts/summary')),
    getStatistics: () => handleApiCall(() => api.get('/alerts/statistics')),
    getTrends: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return handleApiCall(() => api.get(`/alerts/trends${queryString ? `?${queryString}` : ''}`));
    },
    getByLevel: (level, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return handleApiCall(() => api.get(`/alerts/level/${level}${queryString ? `?${queryString}` : ''}`));
    },
    getByLevelRange: (minLevel, maxLevel, params = {}) => {
      const queryString = new URLSearchParams({ ...params, levelMin: minLevel, levelMax: maxLevel }).toString();
      return handleApiCall(() => api.get(`/alerts${queryString ? `?${queryString}` : ''}`));
    },
    resolve: (alertId) => handleApiCall(() => api.put(`/alerts/${alertId}/resolve`)),
    acknowledge: (alertId) => handleApiCall(() => api.put(`/alerts/${alertId}/acknowledge`)),
    getByLocation: (locationId, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return handleApiCall(() => api.get(`/alerts/location/${locationId}${queryString ? `?${queryString}` : ''}`));
    },
    getByParameter: (parameter) => handleApiCall(() => api.get(`/alerts/parameters/${parameter}`)),
    getRecentAlerts: (limit = 10) => {
      return handleApiCall(() => api.get('/alerts/recent', { params: { limit } }));
    },
  },

  // Chatbot endpoints
  chatbot: {
    sendMessage: (data) => handleApiCall(() => api.post('/chatbot/message', data)),
    getConversation: (sessionId) => handleApiCall(() => api.get(`/chatbot/conversation/${sessionId}`)),
    clearConversation: (sessionId) => handleApiCall(() => api.delete(`/chatbot/conversation/${sessionId}`)),
    health: () => handleApiCall(() => api.get('/chatbot/health')),
  },

  // Convenience methods for backward compatibility
  getLocations: () => apiService.locations.getAll(),
  getForecasts: (params = {}) => apiService.forecasts.getAll(params),
  getForecastsForLocation: (locationId) => apiService.forecasts.getLatest(locationId),
  generateForecast: (locationId) => apiService.forecasts.generate(locationId),
  generateAllForecasts: () => apiService.forecasts.generateAll(),
};

// Utility functions
export const formatApiError = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  return error.message || 'An unexpected error occurred';
};

export const isApiAvailable = async () => {
  try {
    await apiService.health();
    return true;
  } catch (error) {
    return false;
  }
};

// Mock data for development (when API is not available)
export const mockData = {
  locations: [
    {
      _id: '1',
      name: 'Haridwar',
      city: 'Haridwar',
      state: 'Uttarakhand',
      coordinates: { coordinates: [78.1642, 29.9457] },
      riverKm: 253,
      isActive: true,
    },
    {
      _id: '2',
      name: 'Kanpur',
      city: 'Kanpur',
      state: 'Uttar Pradesh',
      coordinates: { coordinates: [80.3319, 26.4499] },
      riverKm: 1017,
      isActive: true,
    },
    {
      _id: '3',
      name: 'Varanasi',
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      coordinates: { coordinates: [83.0047, 25.3176] },
      riverKm: 1384,
      isActive: true,
    },
  ],
  
  waterQuality: [
    {
      _id: '1',
      locationId: {
        _id: '1',
        name: 'Haridwar',
        city: 'Haridwar',
      },
      timestamp: new Date().toISOString(),
      parameters: {
        dissolvedOxygen: { value: 7.2, unit: 'mg/L', status: 'good' },
        biochemicalOxygenDemand: { value: 3.1, unit: 'mg/L', status: 'excellent' },
        nitrate: { value: 12.5, unit: 'mg/L', status: 'good' },
        fecalColiform: { value: 180, unit: 'MPN/100ml', status: 'good' },
        ph: { value: 7.8, unit: '', status: 'excellent' },
        turbidity: { value: 4.2, unit: 'NTU', status: 'excellent' },
      },
      waterQualityIndex: 78,
      overallStatus: 'good',
    },
    {
      _id: '2',
      locationId: {
        _id: '2',
        name: 'Kanpur',
        city: 'Kanpur',
      },
      timestamp: new Date().toISOString(),
      parameters: {
        dissolvedOxygen: { value: 4.8, unit: 'mg/L', status: 'fair' },
        biochemicalOxygenDemand: { value: 6.2, unit: 'mg/L', status: 'fair' },
        nitrate: { value: 28.3, unit: 'mg/L', status: 'fair' },
        fecalColiform: { value: 1200, unit: 'MPN/100ml', status: 'fair' },
        ph: { value: 7.4, unit: '', status: 'good' },
        turbidity: { value: 12.1, unit: 'NTU', status: 'fair' },
      },
      waterQualityIndex: 52,
      overallStatus: 'fair',
    },
  ],

  alerts: [
    {
      id: '1',
      location: { name: 'Kanpur', city: 'Kanpur' },
      timestamp: new Date().toISOString(),
      parameter: 'fecalColiform',
      value: 1200,
      unit: 'MPN/100ml',
      severity: 'medium',
      message: 'High Fecal Coliform levels detected at Kanpur: 1200 MPN/100ml',
      type: 'current',
    },
  ],
};

export default api;