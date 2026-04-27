import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401 — emit an event so AuthContext can handle it via React Router (no page reload)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthRoute = err.config?.url?.startsWith('/auth');
    if (err.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(err);
  }
);

// Auth
export const registerUser  = (data) => api.post('/auth/register', data);
export const loginUser     = (data) => api.post('/auth/login', data);
export const getMe         = ()     => api.get('/auth/me');

// Transactions
export const getTransactions        = (params) => api.get('/transactions', { params });
export const getTransaction         = (id)     => api.get(`/transactions/${id}`);
export const createTransaction      = (data)   => api.post('/transactions', data);
export const updateTransaction      = (id, data) => api.put(`/transactions/${id}`, data);
export const deleteTransaction      = (id)     => api.delete(`/transactions/${id}`);
export const getTransactionSummary  = (params) => api.get('/transactions/summary', { params });
export const getDailyTotals         = (params) => api.get('/transactions/daily', { params });

// Goals
export const getGoals    = ()          => api.get('/goals');
export const createGoal  = (data)      => api.post('/goals', data);
export const updateGoal  = (id, data)  => api.put(`/goals/${id}`, data);
export const deleteGoal  = (id)        => api.delete(`/goals/${id}`);

// User
export const getProfile     = ()       => api.get('/users/profile');
export const updateProfile  = (data)   => api.patch('/users/profile', data);

// AI
export const getBudgetAdvice       = ()             => api.post('/ai/budget-advice');
export const getSavingsSuggestions = ()             => api.post('/ai/savings-suggestions');
export const getAIInsights         = ()             => api.post('/ai/budget-advice');
export const sendChatMessage       = (message, history) => api.post('/ai/chat', { message, history });

// Market
export const getMarketPulse = () => api.get('/market/pulse');

export default api;
