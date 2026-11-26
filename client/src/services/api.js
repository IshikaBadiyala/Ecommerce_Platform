/**
 * Axios API Service Client
 * ------------------------
 * Centralized HTTP client configured for cross-origin requests with HttpOnly cookies.
 * 
 * Viva Concepts:
 * - Axios: Promise-based HTTP client for browser and Node.js.
 * - withCredentials: true: Instructs browser to attach cookies (HttpOnly session token)
 *   in cross-origin requests.
 * - Request Interceptors: Pre-processes outgoing requests to inject fallback Authorization
 *   headers for maximum client compatibility.
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send HttpOnly cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Injects Authorization Bearer token from localStorage as fallback
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('buynest_token') || localStorage.getItem('nexora_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to format error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract readable server error message
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';
    return Promise.reject(new Error(message));
  }
);

// Auth Endpoints
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: (credential) => api.post('/auth/google', { credential }),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Product Endpoints
export const productAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  addReview: (id, data) => api.post(`/products/${id}/reviews`, data),
  deleteReview: (productId, reviewId) => api.delete(`/products/${productId}/reviews/${reviewId}`),
};

// Payment Gateway (Razorpay) Endpoints
export const paymentAPI = {
  createOrder: (data) => api.post('/payment/create-order', data),
  verifyPayment: (data) => api.post('/payment/verify', data),
  getKey: () => api.get('/payment/key'),
};

// Cart Endpoints (MongoDB-based persistence)
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart', data),
  updateQuantity: (data) => api.put('/cart/item', data),
  removeFromCart: (productId) => api.delete(`/cart/item/${productId}`),
  clearCart: () => api.delete('/cart'),
};

// Wishlist Endpoints (MongoDB-based persistence)
export const wishlistAPI = {
  getWishlist: () => api.get('/wishlist'),
  addToWishlist: (data) => api.post('/wishlist', data),
  toggleWishlist: (data) => api.post('/wishlist/toggle', data),
  removeFromWishlist: (productId) => api.delete(`/wishlist/${productId}`),
  clearWishlist: () => api.delete('/wishlist'),
};

// Order Endpoints
export const orderAPI = {
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my-orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  createRazorpayOrder: (data) => api.post('/payment/create-order', data),
  verifyRazorpayPayment: (data) => api.post('/payment/verify', data),
};

export default api;
