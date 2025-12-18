import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
});

// Add a request interceptor: A function which runs before every API request, allowing us to attach the auth token
api.interceptors.request.use((config) => {
  // Get the token from local storage
  const token = localStorage.getItem('authToken');
  if (token) {
    // If the token exists, add it to the Autorization header
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;