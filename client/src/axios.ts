// axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    console.log('=== AXIOS REQUEST ===');
    console.log('URL:', config.url);
    console.log('Method:', config.method);
    console.log('With credentials:', config.withCredentials);
    console.log('Base URL:', config.baseURL);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    console.log('=== AXIOS RESPONSE ===');
    console.log('Status:', response.status);
    console.log('URL:', response.config.url);
    return response;
  },
  (error) => {
    console.error('=== AXIOS ERROR ===');
    console.error('URL:', error.config?.url);
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Headers:', error.response?.headers);
    
    if (error.response?.status === 401) {
      console.log("🔄 401 Unauthorized");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  },
);

export default api;
export { api };