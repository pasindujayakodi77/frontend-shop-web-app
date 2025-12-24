import axios from 'axios';

// Use environment variable if available, otherwise default to localhost
// If your backend doesn't use /api prefix, change this to 'http://localhost:5000'
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('=== API Configuration ===');
console.log('REACT_APP_API_URL env var:', process.env.REACT_APP_API_URL);
console.log('Final API_URL:', API_URL);
console.log('========================');

// Get token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Get userId from localStorage
const getUserId = () => {
  return localStorage.getItem('userId');
};

// Set up axios defaults
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ===== SALES API =====
export const salesAPI = {
  // Get all sales for the current user
  getAll: async () => {
    try {
      const response = await axiosInstance.get('/sales');
      return response.data;
    } catch (error) {
      console.error('Error fetching sales:', error);
      throw error;
    }
  },

  // Create a new sale
  create: async (saleData) => {
    try {
      const response = await axiosInstance.post('/sales', saleData);
      return response.data;
    } catch (error) {
      console.error('Error creating sale:', error);
      throw error;
    }
  },

  // Delete a sale
  delete: async (saleId) => {
    try {
      const response = await axiosInstance.delete(`/sales/${saleId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting sale:', error);
      throw error;
    }
  }
};

// ===== EXPENSES API =====
export const expensesAPI = {
  // Get all expenses for the current user
  getAll: async () => {
    try {
      const response = await axiosInstance.get('/expenses');
      return response.data;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  },

  // Create a new expense
  create: async (expenseData) => {
    try {
      const response = await axiosInstance.post('/expenses', expenseData);
      return response.data;
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  },

  // Update an expense
  update: async (expenseId, expenseData) => {
    try {
      const response = await axiosInstance.put(`/expenses/${expenseId}`, expenseData);
      return response.data;
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  },

  // Delete an expense
  delete: async (expenseId) => {
    try {
      const response = await axiosInstance.delete(`/expenses/${expenseId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }
};

// ===== PRODUCTS/INVENTORY API =====
export const productsAPI = {
  // Get all products for the current user
  getAll: async () => {
    try {
      const response = await axiosInstance.get('/products');
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Create a new product
  create: async (productData) => {
    try {
      console.log('Creating product at:', `${API_URL}/products`);
      const response = await axiosInstance.post('/products', productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      console.error('Endpoint:', `${API_URL}/products`);
      console.error('Product data:', productData);
      if (error.response) {
        console.error('Server response:', error.response.data);
        console.error('Status code:', error.response.status);
      }
      throw error;
    }
  },

  // Update a product
  update: async (productId, productData) => {
    try {
      const response = await axiosInstance.put(`/products/${productId}`, productData);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      console.error('Product ID:', productId);
      console.error('Product data:', productData);
      if (error.response) {
        console.error('Server response:', error.response.data);
      }
      throw error;
    }
  },

  // Delete a product
  delete: async (productId) => {
    try {
      const response = await axiosInstance.delete(`/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
};

export default axiosInstance;
