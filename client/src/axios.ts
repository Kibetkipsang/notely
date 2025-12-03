import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",  
  withCredentials: true,             
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('=== AXIOS REQUEST ===');
    console.log('URL:', config.url);
    console.log('Method:', config.method);
    console.log('With credentials:', config.withCredentials);
    
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token attached to request');
    } else {
      console.log('No token found in localStorage');
    }
    
    console.log('Headers:', config.headers);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    console.log('=== AXIOS RESPONSE ERROR ===');
    console.log('Status:', error.response?.status);
    console.log('URL:', originalRequest?.url);
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.log('401 Unauthorized - Token missing or invalid');
      
      // If this is not a login request and we haven't tried to refresh yet
      if (!originalRequest.url?.includes('/auth/login') && 
          !originalRequest.url?.includes('/auth/refresh') &&
          !originalRequest._retry) {
        
        originalRequest._retry = true;
        
        try {
          console.log('Attempting to refresh token...');
          
          // Try to refresh token
          const refreshResponse = await axios.post(
            'http://localhost:5000/auth/refresh',
            {},
            { withCredentials: true }
          );
          
          const { token } = refreshResponse.data;
          
          if (token) {
            // Store new token
            localStorage.setItem('token', token);
            console.log('Token refreshed successfully');
            
            // Update the authorization header
            originalRequest.headers.Authorization = `Bearer ${token}`;
            
            // Retry the original request
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.log('Token refresh failed:', refreshError);
          // Clear token and redirect to login
          localStorage.removeItem('token');
          window.location.href = '/auth';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
export { api };