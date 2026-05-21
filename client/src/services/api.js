import axios from 'axios';

// Create a centralized Axios instance
const api = axios.create({
  baseURL: '/api', // Vite dev proxy redirects /api → http://localhost:5000/api
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Automatically inject JWT token into the Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('crm_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Capture unauthorized/expired token 401 events globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If a 401 Unauthorized status is returned, the JWT is either invalid, tampered, or expired
    if (error.response && error.response.status === 401) {
      console.warn('[API Client Warning] 401 Unauthorized captured. Clearing active credentials.');
      
      localStorage.removeItem('crm_token');
      localStorage.removeItem('crm_user');
      
      // Dispatch a custom window event that the AuthContext can listen to for synchronous state updates
      window.dispatchEvent(new Event('auth-unauthorized'));
    }
    
    return Promise.reject(error);
  }
);

export default api;
