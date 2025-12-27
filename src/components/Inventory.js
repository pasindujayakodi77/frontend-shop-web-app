import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { productsAPI } from "../utils/api";

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [formData, setFormData] = useState({
    name: "",
    productNumber: "",
    brand: "",
    category: "",
    quantity: "",
    costPrice: "",
    sellingPrice: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchHistory();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productsAPI.getAll();
      const productsArray = data.products || data;
      setProducts(Array.isArray(productsArray) ? productsArray : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      alert("Failed to load products. Please make sure you are logged in and the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const data = await productsAPI.getHistory();
      const historyArray = data.history || data;
      setHistory(Array.isArray(historyArray) ? historyArray : []);
    } catch (error) {
      console.error("Error fetching product history:", error);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
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
      productNumber: formData.productNumber,
      brand: formData.brand,
      category: formData.category,
      quantity: parseInt(formData.quantity, 10),
      costPrice: parseFloat(formData.costPrice),
      sellingPrice: parseFloat(formData.sellingPrice)
    };

    try {
      if (editingProduct) {
        await productsAPI.update(editingProduct._id || editingProduct.id, productData);
        setEditingProduct(null);
      } else {
        await productsAPI.create(productData);
      }

      await fetchProducts();
      await fetchHistory();

      setFormData({
        name: "",
        productNumber: "",
        brand: "",
        category: "",
        quantity: "",
        costPrice: "",
        sellingPrice: ""
      });
      setShowForm(false);
    } catch (error) {
      console.error("Error saving product:", error);
      let errorMessage = "Failed to save product. ";

      if (error.response) {
        errorMessage += error.response.data.message || error.response.data.error || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage += "Cannot reach server. Please check your connection and ensure the backend is running.";
      } else {
        errorMessage += error.message;
      }

      alert(errorMessage);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      productNumber: product.productNumber || "",
      brand: product.brand || "",
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
        await fetchHistory();
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product. Please try again.");
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      productNumber: "",
      brand: "",
      category: "",
      quantity: "",
      costPrice: "",
      sellingPrice: ""
    });
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const displayedProducts = useMemo(() => {
    if (activeTab !== "recent") return products;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return products.filter((product) => {
      if (!product.createdAt) return false;
      return new Date(product.createdAt) >= sevenDaysAgo;
    });
  }, [activeTab, products]);

  const formatChangeDetails = (item) => {
    if (item.action === "delete") return "Deleted";
    if (!Array.isArray(item.changedFields) || item.changedFields.length === 0) return "-";

    const before = item.before || {};
    const after = item.after || {};

    return item.changedFields.map((field) => {
      const prev = before[field];
      const next = after[field];

      if (field === "quantity") {
        const hasNumbers = typeof prev === "number" && typeof next === "number";
        const delta = hasNumbers ? next - prev : null;
        const deltaText = delta === null ? "" : ` (${delta >= 0 ? "+" : ""}${delta})`;
        return `quantity: ${prev ?? "-"} -> ${next ?? "-"}${deltaText}`;
      }

      return `${field}: ${prev ?? "-"} -> ${next ?? "-"}`;
    }).join("; ");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-200">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-cyan-400"></div>
          <p className="text-sm text-slate-400">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 select-none">
        <div className="absolute -top-44 -left-36 h-80 w-80 rounded-full bg-cyan-500/16 blur-3xl" />
        <div className="absolute -bottom-52 -right-28 h-96 w-96 rounded-full bg-emerald-500/14 blur-[110px]" />
        <div className="absolute top-1/3 right-1/4 h-44 w-44 rotate-12 rounded-full bg-gradient-to-br from-blue-600/25 via-cyan-500/25 to-emerald-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.03),_transparent_35%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="rounded-2xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl shadow-[0_24px_120px_-50px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-emerald-400 to-blue-700 shadow-lg shadow-cyan-500/35 text-slate-900">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                  <path d="M4 6h2l1.5 9h9l1.5-6H7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="10" cy="18" r="1" fill="currentColor" />
                  <circle cx="16" cy="18" r="1" fill="currentColor" />
                </svg>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Inventory</p>
                <h1 className="text-2xl font-semibold text-slate-50">Products & Stock</h1>
              </div>
            </div>
            <button
              onClick={handleBackToDashboard}
              className="rounded-xl border border-slate-700/70 bg-slate-800/80 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-400/60 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              ← Back to Dashboard
            </button>
          </div>
        </header>

        <main className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-50">Products List</h2>
              <p className="text-sm text-slate-400">Manage stock, pricing, and categories.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="inline-flex rounded-xl border border-slate-800/70 bg-slate-900/60 p-1 text-sm font-semibold text-slate-200">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`rounded-lg px-3 py-1.5 transition ${
                    activeTab === "all"
                      ? "bg-slate-800 text-white shadow-inner shadow-slate-900"
                      : "hover:text-white"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab("recent")}
                  className={`rounded-lg px-3 py-1.5 transition ${
                    activeTab === "recent"
                      ? "bg-slate-800 text-white shadow-inner shadow-slate-900"
                      : "hover:text-white"
                  }`}
                >
                  Last 7 days
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`rounded-lg px-3 py-1.5 transition ${
                    activeTab === "history"
                      ? "bg-slate-800 text-white shadow-inner shadow-slate-900"
                      : "hover:text-white"
                  }`}
                >
                  History
                </button>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/25 transition hover:-translate-y-[1px] focus-visible:ring-2 focus-visible:ring-cyan-200"
              >
                {showForm ? "Cancel" : "+ Add New Product"}
              </button>
            </div>
          </div>

          {showForm && (
            <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl p-6 shadow-[0_18px_80px_-45px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
              <h3 className="text-lg font-semibold text-slate-50 mb-4">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border border-slate-800/70 bg-slate-800/70 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-500/30"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Product Number</label>
                  <input
                    type="text"
                    name="productNumber"
                    value={formData.productNumber}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-800/70 bg-slate-800/70 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-500/30"
                    placeholder="e.g., SKU-1045"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-800/70 bg-slate-800/70 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-500/30"
                    placeholder="Enter brand name"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border border-slate-800/70 bg-slate-800/70 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-500/30"
                    placeholder="Enter category"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full rounded-xl border border-slate-800/70 bg-slate-800/70 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-500/30"
                    placeholder="Enter quantity"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Cost Price (LKR)</label>
                  <input
                    type="number"
                    name="costPrice"
                    value={formData.costPrice}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full rounded-xl border border-slate-800/70 bg-slate-800/70 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-500/30"
                    placeholder="Enter cost price"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Selling Price (LKR)</label>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full rounded-xl border border-slate-800/70 bg-slate-800/70 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-500/30"
                    placeholder="Enter selling price"
                  />
                </div>

                <div className="md:col-span-2 flex gap-3">
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/25 transition hover:-translate-y-[1px] focus-visible:ring-2 focus-visible:ring-cyan-200"
                  >
                    {editingProduct ? "Update Product" : "Add Product"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-xl border border-slate-700/70 bg-slate-800/70 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-rose-400/60 hover:text-white focus-visible:ring-2 focus-visible:ring-rose-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab !== "history" && (
            <>
              <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl shadow-[0_18px_80px_-45px_rgba(15,23,42,0.9)] ring-1 ring-white/5 overflow-hidden">
                {displayedProducts.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    {activeTab === "recent"
                      ? "No products added in the last 7 days."
                      : "No products available. Add your first product!"}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-800/80 text-slate-300">
                        <tr>
                          <th className="px-6 py-3 text-left font-semibold">Name</th>
                          <th className="px-6 py-3 text-left font-semibold">Product #</th>
                          <th className="px-6 py-3 text-left font-semibold">Brand</th>
                          <th className="px-6 py-3 text-left font-semibold">Category</th>
                          <th className="px-6 py-3 text-left font-semibold">Quantity</th>
                          <th className="px-6 py-3 text-left font-semibold">Cost Price</th>
                          <th className="px-6 py-3 text-left font-semibold">Selling Price</th>
                          <th className="px-6 py-3 text-left font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70">
                        {displayedProducts.map((product) => (
                          <tr key={product._id || product.id} className="hover:bg-slate-800/50">
                            <td className="px-6 py-3 text-slate-100">{product.name}</td>
                            <td className="px-6 py-3 text-slate-300">{product.productNumber || "-"}</td>
                            <td className="px-6 py-3 text-slate-300">{product.brand || "-"}</td>
                            <td className="px-6 py-3 text-slate-300">{product.category}</td>
                            <td className="px-6 py-3 text-slate-300">{product.quantity}</td>
                            <td className="px-6 py-3 text-slate-300">LKR {product.costPrice.toFixed(2)}</td>
                            <td className="px-6 py-3 text-slate-300">LKR {product.sellingPrice.toFixed(2)}</td>
                            <td className="px-6 py-3 flex gap-3 text-slate-200">
                              <button
                                onClick={() => handleEdit(product)}
                                className="text-cyan-300 transition hover:text-cyan-200"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(product._id || product.id)}
                                className="text-rose-300 transition hover:text-rose-200"
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

              {displayedProducts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4 shadow-[0_18px_80px_-45px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
                    <p className="text-sm text-slate-400">Total Products</p>
                    <p className="text-2xl font-semibold text-slate-50">{displayedProducts.length}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4 shadow-[0_18px_80px_-45px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
                    <p className="text-sm text-slate-400">Total Inventory Value (Cost)</p>
                    <p className="text-2xl font-semibold text-emerald-300">
                      LKR {displayedProducts.reduce((sum, p) => sum + p.costPrice * p.quantity, 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4 shadow-[0_18px_80px_-45px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
                    <p className="text-sm text-slate-400">Total Inventory Value (Selling)</p>
                    <p className="text-2xl font-semibold text-cyan-300">
                      LKR {displayedProducts.reduce((sum, p) => sum + p.sellingPrice * p.quantity, 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "history" && (
            <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl shadow-[0_18px_80px_-45px_rgba(15,23,42,0.9)] ring-1 ring-white/5 overflow-hidden">
              {historyLoading ? (
                <div className="p-12 text-center text-slate-400">Loading history...</div>
              ) : history.length === 0 ? (
                <div className="p-12 text-center text-slate-400">No edits or deletions in the last 90 days.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-800/80 text-slate-300">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold">When</th>
                        <th className="px-6 py-3 text-left font-semibold">Product</th>
                        <th className="px-6 py-3 text-left font-semibold">Action</th>
                        <th className="px-6 py-3 text-left font-semibold">By</th>
                        <th className="px-6 py-3 text-left font-semibold">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {history.map((item) => {
                        const product = item.productId || {};
                        const user = item.userId || {};
                        const actor = user.name || user.email || (user._id || "Unknown user");
                        const changed = Array.isArray(item.changedFields) && item.changedFields.length > 0
                          ? item.changedFields.join(", ")
                          : "-";

                        return (
                          <tr key={item._id} className="hover:bg-slate-800/50">
                            <td className="px-6 py-3 text-slate-300">{new Date(item.createdAt).toLocaleString()}</td>
                            <td className="px-6 py-3 text-slate-100">{product.name || item.before?.name || "Unknown product"}</td>
                            <td className="px-6 py-3 text-slate-100 capitalize">{item.action}</td>
                            <td className="px-6 py-3 text-slate-300">{actor}</td>
                            <td className="px-6 py-3 text-slate-300">{formatChangeDetails(item)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Inventory;
