import api from './axiosConfig';

// Authentication APIs
export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const signupUser = async (name, email, password) => {
  const response = await api.post('/auth/signup', { name, email, password });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Transaction APIs
export const getTransactions = async () => {
  const response = await api.get('/transactions');
  return response.data;
};

export const createTransaction = async (transactionData) => {
  const response = await api.post('/transactions', transactionData);
  return response.data;
};

export const deleteTransaction = async (id) => {
  const response = await api.delete(`/transactions/${id}`);
  return response.data;
};

// Dashboard and Analytics APIs
export const getDashboardSummary = async () => {
  const response = await api.get('/dashboard/summary');
  return response.data;
};

export const getDashboardAnalytics = async () => {
  const response = await api.get('/dashboard/analytics');
  return response.data;
};

// Profile / Settings APIs
export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};

// Income APIs
export const getIncomes = async () => {
  const response = await api.get('/income');
  return response.data;
};

export const createIncome = async (incomeData) => {
  const response = await api.post('/income', incomeData);
  return response.data;
};

export const deleteIncome = async (id) => {
  const response = await api.delete(`/income/${id}`);
  return response.data;
};
