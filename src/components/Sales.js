import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearUserData } from '../utils/auth';
import { salesAPI, productsAPI } from '../utils/api';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([{ productId: "", quantity: "" }]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Load sales and products from backend API
    fetchSalesAndProducts();
  }, []);

  const fetchSalesAndProducts = async () => {
    try {
      setLoading(true);
      const [salesData, productsData] = await Promise.all([
        salesAPI.getAll(),
        productsAPI.getAll()
      ]);
      setSales(Array.isArray(salesData) ? salesData : []);
      // Backend returns {products: [...]} so extract the products array
      const productsArray = productsData.products || productsData;
      setProducts(Array.isArray(productsArray) ? productsArray : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setSales([]);
      setProducts([]);
      alert('Failed to load data. Please make sure you are logged in and the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProductRow = () => {
    setSelectedProducts([...selectedProducts, { productId: "", quantity: "" }]);
  };

  const handleRemoveProductRow = (index) => {
    const updatedProducts = selectedProducts.filter((_, i) => i !== index);
    setSelectedProducts(updatedProducts);
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts[index][field] = value;
    setSelectedProducts(updatedProducts);
  };

  const calculateSaleTotals = (saleProducts) => {
    let totalRevenue = 0;
    let totalProfit = 0;

    saleProducts.forEach((sp) => {
      const product = products.find((p) => p._id === sp.productId || p.id === parseInt(sp.productId));
      if (product) {
        const quantity = parseInt(sp.quantity);
        const revenue = product.sellingPrice * quantity;
        const cost = product.costPrice * quantity;
        totalRevenue += revenue;
        totalProfit += revenue - cost;
      }
    });

    return { totalRevenue, totalProfit };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that at least one product is selected
    const validProducts = selectedProducts.filter(
      (sp) => sp.productId && sp.quantity && parseInt(sp.quantity) > 0
    );

    if (validProducts.length === 0) {
      alert("Please select at least one product with a valid quantity.");
      return;
    }

    // Check if sufficient inventory is available
    let insufficientStock = false;
    validProducts.forEach((sp) => {
      const product = products.find((p) => p._id === sp.productId || p.id === parseInt(sp.productId));
      if (product && product.quantity < parseInt(sp.quantity)) {
        alert(`Insufficient stock for ${product.name}. Available: ${product.quantity}`);
        insufficientStock = true;
      }
    });

    if (insufficientStock) {
      return;
    }

    // Calculate totals
    const { totalRevenue, totalProfit } = calculateSaleTotals(validProducts);

    // Create sale record with product details
    const saleProducts = validProducts.map((sp) => {
      const product = products.find((p) => p._id === sp.productId || p.id === parseInt(sp.productId));
      return {
        productId: sp.productId,
        productName: product.name,
        quantity: parseInt(sp.quantity),
        sellingPrice: product.sellingPrice,
        costPrice: product.costPrice
      };
    });

    const newSale = {
      date: new Date().toISOString(),
      products: saleProducts,
      totalRevenue,
      totalProfit
    };

    try {
      // Save new sale to backend
      const createdSale = await salesAPI.create(newSale);
      
      // Update inventory quantities on backend
      for (const sp of validProducts) {
        const product = products.find((p) => p._id === sp.productId || p.id === parseInt(sp.productId));
        if (product) {
          const updatedQuantity = product.quantity - parseInt(sp.quantity);
          await productsAPI.update(product._id, { quantity: updatedQuantity });
        }
      }

      // Refresh data from backend
      await fetchSalesAndProducts();

      // Reset form
      setSelectedProducts([{ productId: "", quantity: "" }]);
      setShowForm(false);
      alert("Sale recorded successfully!");
    } catch (error) {
      console.error('Error recording sale:', error);
      alert('Failed to record sale. Please try again.');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedProducts([{ productId: "", quantity: "" }]);
  };

  const handleLogout = () => {
    clearUserData();
    localStorage.removeItem("token");
    navigate("/login");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatCurrency = (amount) => {
    return `LKR ${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            {showForm ? "Cancel" : "Record New Sale"}
          </button>
        </div>

        {/* Sale Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Record New Sale</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Product Selection Rows */}
                {selectedProducts.map((sp, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product
                      </label>
                      <select
                        value={sp.productId}
                        onChange={(e) =>
                          handleProductChange(index, "productId", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select a product</option>
                        {products.map((product) => (
                          <option key={product._id || product.id} value={product._id || product.id}>
                            {product.name} - Stock: {product.quantity} - Price: LKR
                            {product.sellingPrice}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-32">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={sp.quantity}
                        onChange={(e) =>
                          handleProductChange(index, "quantity", e.target.value)
                        }
                        min="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Qty"
                        required
                      />
                    </div>

                    {selectedProducts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveProductRow(index)}
                        className="mt-8 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}

                {/* Add Product Button */}
                <button
                  type="button"
                  onClick={handleAddProductRow}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  + Add Another Product
                </button>
              </div>

              {/* Form Actions */}
              <div className="mt-6 flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Record Sale
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Sales Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Sales History</h2>
          </div>

          {sales.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No sales recorded yet. Click "Record New Sale" to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Products
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Profit
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(sale.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="space-y-1">
                          {sale.products.map((product, idx) => (
                            <div key={idx}>
                              {product.productName} x {product.quantity}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {formatCurrency(sale.totalRevenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {formatCurrency(sale.totalProfit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Statistics */}
        {sales.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-500 uppercase">Total Sales</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">{sales.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-500 uppercase">Total Revenue</h3>
              <p className="mt-2 text-3xl font-bold text-green-600">
                {formatCurrency(sales.reduce((sum, sale) => sum + sale.totalRevenue, 0))}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-500 uppercase">Total Profit</h3>
              <p className="mt-2 text-3xl font-bold text-blue-600">
                {formatCurrency(sales.reduce((sum, sale) => sum + sale.totalProfit, 0))}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sales;
