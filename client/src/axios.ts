import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",  
  withCredentials: true,             
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - MINIMAL VERSION
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Just return the error - let components handle auth issues
    return Promise.reject(error);
  }
);

export default api;
export { api };