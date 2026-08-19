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

export const fetchParkingLots = async (start = null, end = null) => {
  const params = {};
  if (start && end) {
    params.start = start;
    params.end = end;
  }
  const response = await apiClient.get('/parking-lot', { params });
  return response.data;
};

export const processMockPayment = async (bookingId) => {
  const response = await apiClient.post('/payment/mock-pay', { bookingId });
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await apiClient.post('/user/login', { email, password });
  return response.data;
};

export const signupUser = async (name, email, phone, password) => {
  const response = await apiClient.post('/user/signup', { name, email, phone, password });
  return response.data;
};

export const getLotDetails = async (lotId) => {
  const response = await apiClient.get(`/parking-lot/${lotId}`);
  return response.data;
};

export const getLotAvailability = async (lotId, startTime, endTime) => {
  const response = await apiClient.get(`/parking-lot/${lotId}/availability`, {
    params: { start: startTime, end: endTime }
  });
  return response.data;
};

export const getUserVehicles = async () => {
  const response = await apiClient.get('/vehicle');
  return response.data;
};

export const createVehicle = async (numberPlate, vehicleType) => {
  const response = await apiClient.post('/vehicle', { numberPlate, vehicleType });
  return response.data;
};

export const createBooking = async (parkingSlotId, vehicleId, startTime, endTime) => {
  const response = await apiClient.post('/booking', { parkingSlotId, vehicleId, startTime, endTime });
  return response.data;
};

export const checkoutBooking = async (bookingId) => {
  const response = await apiClient.post(`/booking/${bookingId}/checkout`);
  return response.data;
};

// Admin Endpoints
export const getGlobalActiveBookings = async () => {
  const response = await apiClient.get('/admin/active-bookings');
  return response.data;
};

export const promoteUserToAdmin = async (email) => {
  const response = await apiClient.post('/admin/promote', { email });
  return response.data;
};

export const getUserBookings = async () => {
  const response = await apiClient.get('/booking/my-bookings');
  return response.data;
};
