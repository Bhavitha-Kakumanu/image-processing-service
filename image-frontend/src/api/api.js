import axios from 'axios';

const authApi = axios.create({ baseURL: 'http://localhost:8081' });
const imageApi = axios.create({ baseURL: 'http://localhost:8082' });

imageApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const registerUser = (data) => authApi.post('/api/auth/register', data);
export const loginUser = (data) => authApi.post('/api/auth/login', data);

export const uploadImage = (formData) => imageApi.post('/api/images/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const bulkUploadImages = (formData) => imageApi.post('/api/images/upload/bulk', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const listImages = () => imageApi.get('/api/images');
export const deleteImage = (id) => imageApi.delete(`/api/images/${id}`);
export const resizeImage = (id, width, height) => imageApi.get(`/api/images/${id}/resize`, { params: { width, height }, responseType: 'blob' });
export const cropImage = (id, x, y, width, height) => imageApi.get(`/api/images/${id}/crop`, { params: { x, y, width, height }, responseType: 'blob' });
export const rotateImage = (id, angle) => imageApi.get(`/api/images/${id}/rotate`, { params: { angle }, responseType: 'blob' });
export const watermarkImage = (id, text) => imageApi.get(`/api/images/${id}/watermark`, { params: { text }, responseType: 'blob' });
export const convertImage = (id, format) => imageApi.get(`/api/images/${id}/convert`, { params: { format }, responseType: 'blob' });
export const retrieveImage = (id) => imageApi.get(`/api/images/${id}/retrieve`, { responseType: 'blob' });