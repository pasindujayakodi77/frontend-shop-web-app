import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productsAPI } from '../utils/api';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    costPrice: "",
    sellingPrice: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Load products from backend API on mount
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productsAPI.getAll();
      // Backend returns {products: [...]} so extract the products array
      const productsArray = data.products || data;
      setProducts(Array.isArray(productsArray) ? productsArray : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      alert('Failed to load products. Please make sure you are logged in and the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const productData = {
      name: formData.name,
      category: formData.category,
      quantity: parseInt(formData.quantity),
      costPrice: parseFloat(formData.costPrice),
      sellingPrice: parseFloat(formData.sellingPrice)
    };

    try {
      if (editingProduct) {
        // Update existing product
        await productsAPI.update(editingProduct._id || editingProduct.id, productData);
        setEditingProduct(null);
      } else {
        // Add new product
        await productsAPI.create(productData);
      }

      // Refresh products from backend
      await fetchProducts();

      // Reset form
      setFormData({
        name: "",
        category: "",
        quantity: "",
        costPrice: "",
        sellingPrice: ""
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error saving product:', error);
      let errorMessage = 'Failed to save product. ';
      
      if (error.response) {
        // Server responded with error
        errorMessage += error.response.data.message || error.response.data.error || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request made but no response
        errorMessage += 'Cannot reach server. Please check your connection and ensure the backend is running.';
      } else {
        // Error in request setup
        errorMessage += error.message;
      }
      
      alert(errorMessage);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      quantity: product.quantity.toString(),
      costPrice: product.costPrice.toString(),
      sellingPrice: product.sellingPrice.toString()
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productsAPI.delete(id);
        await fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      category: "",
      quantity: "",
      costPrice: "",
      sellingPrice: ""
    });
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Inventory Management</h1>
            <button
              onClick={handleBackToDashboard}
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded transition duration-200"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Product Button */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Products List</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition duration-200 font-semibold"
          >
            {showForm ? "Cancel" : "+ Add New Product"}
          </button>
        </div>

        {/* Add/Edit Product Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quantity"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Cost Price ($)
                </label>
                <input
                  type="number"
                  name="costPrice"
                  value={formData.costPrice}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter cost price"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Selling Price ($)
                </label>
                <input
                  type="number"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter selling price"
                />
              </div>

              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200 font-semibold"
                >
                  {editingProduct ? "Update Product" : "Add Product"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition duration-200 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {products.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg">No products available. Add your first product!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Selling Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id || product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {product.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        ${product.costPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        ${product.sellingPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product._id || product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {products.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-gray-600 text-sm">Total Products</p>
              <p className="text-2xl font-bold text-blue-600">{products.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-gray-600 text-sm">Total Inventory Value (Cost)</p>
              <p className="text-2xl font-bold text-green-600">
                ${products.reduce((sum, p) => sum + (p.costPrice * p.quantity), 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-gray-600 text-sm">Total Inventory Value (Selling)</p>
              <p className="text-2xl font-bold text-purple-600">
                ${products.reduce((sum, p) => sum + (p.sellingPrice * p.quantity), 0).toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Inventory;
