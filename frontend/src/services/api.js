import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'https://ganga-river-water-d2wo.vercel.app' || 'http://localhost:5001/api',
  timeout: 10000,
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

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data.message || 'Server error occurred');
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error - please check your connection');
    } else {
      // Something else happened
      throw new Error('An unexpected error occurred');
    }
  }
);

// API endpoints
export const apiService = {
  // Health check
  health: () => api.get('/health'),
  
  // Locations
  locations: {
    getAll: () => api.get('/locations'),
    getById: (id) => api.get(`/locations/${id}`),
    getNearby: (lat, lng, radius = 50) => 
      api.get(`/locations/nearby?lat=${lat}&lng=${lng}&radius=${radius}`),
    create: (data) => api.post('/locations', data),
    update: (id, data) => api.put(`/locations/${id}`, data),
    delete: (id) => api.delete(`/locations/${id}`),
  },

  // Water Quality
  waterQuality: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return api.get(`/water-quality${queryString ? `?${queryString}` : ''}`);
    },
    getLatest: () => api.get('/water-quality/latest'),
    getByLocation: (locationId, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return api.get(`/water-quality/location/${locationId}${queryString ? `?${queryString}` : ''}`);
    },
    getTrends: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return api.get(`/water-quality/trends${queryString ? `?${queryString}` : ''}`);
    },
    getCurrentAlerts: () => api.get('/water-quality/alerts'),
    create: (data) => api.post('/water-quality', data),
  },

  // Forecasts
  forecasts: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return api.get(`/forecasts${queryString ? `?${queryString}` : ''}`);
    },
    getLatest: (locationId) => api.get(`/forecasts/latest/${locationId}`),
    getAllLocations: () => api.get('/forecasts/all-locations'),
    generate: (locationId) => api.post(`/forecasts/generate/${locationId}`),
    generateAll: () => api.post('/forecasts/generate-all'),
  },

  // Alerts
  alerts: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return api.get(`/alerts${queryString ? `?${queryString}` : ''}`);
    },
    getSummary: () => api.get('/alerts/summary'),
    getByLocation: (locationId, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return api.get(`/alerts/location/${locationId}${queryString ? `?${queryString}` : ''}`);
    },
    getByParameter: (parameter) => api.get(`/alerts/parameters/${parameter}`),
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