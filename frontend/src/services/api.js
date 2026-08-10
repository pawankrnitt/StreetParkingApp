import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optionally add an interceptor for JWT auth later
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchParkingLots = async () => {
  const response = await apiClient.get('/parking-lot');
  return response.data;
};

export const processMockPayment = async (bookingId) => {
  const response = await apiClient.post('/payment/mock-pay', { bookingId });
  return response.data;
};
