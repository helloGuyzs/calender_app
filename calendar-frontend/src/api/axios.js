import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://a9c6-106-216-252-199.ngrok-free.app',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for debugging
axiosInstance.interceptors.request.use(request => {
  console.log('Making request with cookies:', document.cookie);
  return request;
});

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
  response => {
    console.log('Response headers:', response.headers);
    return response;
  },
  error => {
    console.error('Request failed:', error);
    return Promise.reject(error);
  }
);

export default axiosInstance;