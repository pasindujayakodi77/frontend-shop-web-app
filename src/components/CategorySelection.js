import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setUserData } from '../utils/auth';

const CategorySelection = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const categories = [
    'Computer Shop',
    'Grocery Store',
    'Clothing Store',
    'Pharmacy',
    'Restaurant'
  ];

  const handleCategorySelect = async (category) => {
    setLoading(true);
    setError('');
    setSelectedCategory(category);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please login.');
        navigate('/login');
        return;
      }

      try {
        const response = await axios.put(
          'http://localhost:5000/api/auth/update-category', 
          { shopCategory: category },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'x-auth-token': token
            }
          }
        );

        if (response.data) {
          // Store category in user-specific localStorage
          setUserData('userCategory', category);
          navigate('/dashboard');
        }
      } catch (err) {
        // If endpoint doesn't exist (404), store locally and continue
        if (err.response?.status === 404 || err.response?.data?.error?.includes('Cannot')) {
          console.warn('Backend endpoint not available. Storing category locally.');
          setUserData('userCategory', category);
          navigate('/dashboard');
        } else if (err.response?.status === 401 || err.response?.status === 403 || err.response?.data?.error?.includes('access denied')) {
          // Authentication error - redirect to login
          setError('Session expired or invalid. Please login again.');
          localStorage.removeItem('token');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          throw err;
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to update category. Please try again.';
      setError(errorMsg);
      console.error('Category update error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Select Your Shop Category
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Choose the category that best describes your business
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategorySelect(category)}
              disabled={loading}
              className={`
                p-6 rounded-lg border-2 transition-all duration-200
                ${selectedCategory === category 
                  ? 'border-indigo-600 bg-indigo-50' 
                  : 'border-gray-300 bg-white hover:border-indigo-400 hover:bg-indigo-50'
                }
                ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
              `}
            >
              <div className="flex flex-col items-center">
                <span className="text-4xl mb-2">
                  {getCategoryIcon(category)}
                </span>
                <span className="text-lg font-semibold text-gray-800">
                  {category}
                </span>
              </div>
            </button>
          ))}
        </div>

        {loading && (
          <div className="mt-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">Updating category...</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get icon for each category
const getCategoryIcon = (category) => {
  const icons = {
    'Computer Shop': '💻',
    'Grocery Store': '🛒',
    'Clothing Store': '👔',
    'Pharmacy': '💊',
    'Restaurant': '🍽️'
  };
  return icons[category] || '🏪';
};

export default CategorySelection;
