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

  // Log a sale and update inventory on the backend (uses /sales/add)
  // productsArray: [{ productId, quantity, sellingPrice }]
  // options: { sellingMethod: 'web'|'pos'|'wholesale', date: ISOString, customerName: string }
  add: async (productsArray, options = {}) => {
    try {
      const payload = { products: productsArray };
      if (options.sellingMethod) payload.sellingMethod = options.sellingMethod;
      if (options.date) payload.date = options.date;
      if (options.customerName) payload.customerName = options.customerName;
      const response = await axiosInstance.post('/sales/add', payload);
      return response.data;
    } catch (error) {
      console.error('Error adding/logging sale:', error);
      throw error;
    }
  },

  // Update a sale
  update: async (saleId, saleData) => {
    try {
      const response = await axiosInstance.put(`/sales/${saleId}`, saleData);
      return response.data;
    } catch (error) {
      console.error('Error updating sale:', error);
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
  },

  // Get product change history (last 90 days by default)
  getHistory: async () => {
    try {
      const response = await axiosInstance.get('/products/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching product history:', error);
      throw error;
    }
  },

  // Get products that are at or below their low-stock threshold
  getLowStock: async (threshold) => {
    try {
      const params = typeof threshold === 'number' ? { threshold } : undefined;
      const response = await axiosInstance.get('/products/low-stock', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw error;
    }
  }
};

// ===== DASHBOARD API =====
export const dashboardAPI = {
  // Get dashboard statistics
  getStats: async () => {
    try {
      const response = await axiosInstance.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get daily sales data for current month
  getDailySales: async () => {
    try {
      const response = await axiosInstance.get('/dashboard/daily-sales');
      return response.data;
    } catch (error) {
      console.error('Error fetching daily sales:', error);
      throw error;
    }
  },

  // Get expenses by category
  getExpensesByCategory: async () => {
    try {
      const response = await axiosInstance.get('/dashboard/expenses-by-category');
      return response.data;
    } catch (error) {
      console.error('Error fetching expenses by category:', error);
      throw error;
    }
  },

  // Get revenue vs expenses comparison
  getRevenueVsExpenses: async () => {
    try {
      const response = await axiosInstance.get('/dashboard/revenue-vs-expenses');
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue vs expenses:', error);
      throw error;
    }
  },

  // Get rich insights (monthly revenue, AOV, margin, weekly sales, expense mix, top products, recent sales)
  getInsights: async () => {
    try {
      const response = await axiosInstance.get('/dashboard/insights');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard insights:', error);
      throw error;
    }
  }
};

export default axiosInstance;
