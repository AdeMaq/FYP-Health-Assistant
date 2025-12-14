import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
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

export const chatAPI = {
  // Chat endpoints
  sendMessage: async (query, model = 'openai', includeVideos = true) => {
    const response = await api.post('/api/chat', {
      query,
      model,
      include_videos: includeVideos,
    });
    return response.data;
  },

  // Workout plan generation
  generateWorkoutPlan: async (goal, duration, userData) => {
    const response = await api.post('/api/generate-workout-plan', {
      goal,
      duration,
      user_data: userData,
      include_videos: true,
    });
    return response.data;
  },

  // Diet plan generation
  generateDietPlan: async (goal, dietType, userData) => {
    const response = await api.post('/api/generate-diet-plan', {
      goal,
      diet_type: dietType,
      user_data: userData,
    });
    return response.data;
  },

  // YouTube video search
  searchVideos: async (query, maxResults = 5) => {
    const response = await api.post('/api/search-videos', {
      query,
      max_results: maxResults,
    });
    return response.data;
  },

  // Get video categories
  getVideoCategories: async () => {
    const response = await api.get('/api/video-categories');
    return response.data;
  },

  // User management
  registerUser: async (userData) => {
    const response = await api.post('/api/users', userData);
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  },
};

export const websocketService = {
  connect: () => {
    const wsUrl = API_BASE_URL.replace('http', 'ws') + '/ws/chat';
    return new WebSocket(wsUrl);
  },

  sendMessage: (ws, message) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  },

  disconnect: (ws) => {
    if (ws) {
      ws.close();
    }
  },
};

export default api;