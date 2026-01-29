import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { productsAPI } from "../utils/api";

const BASE_FORM_STATE = {
  name: "",
  productNumber: "",
  barcode: "",
  brand: "",
  category: "",
  quantity: "",
  costPrice: "",
  sellingPrice: "",
  lowStockThreshold: "5"
};

function buildFormState(overrides = {}) {
  return { ...BASE_FORM_STATE, ...overrides };
}

const Inventory = ({ guestMode = false }) => {
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [lowStockLoading, setLowStockLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [formData, setFormData] = useState(() => buildFormState());
  const [guestCount, setGuestCount] = useState(() => {
    if (!guestMode) return 0;
    const raw = localStorage.getItem("guest_inventory_count");
    const parsed = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchHistory();
    fetchLowStock();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      if (guestMode) {
        const demoData = JSON.parse(localStorage.getItem("guest_inventory")) || [];
        setProducts(Array.isArray(demoData) ? demoData : []);
      } else {
        const data = await productsAPI.getAll();
        const productsArray = data.products || data;
        const normalizedProducts = Array.isArray(productsArray) ? productsArray : [];
        setProducts(normalizedProducts);
      }
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
      if (guestMode) {
        setHistory([]);
      } else {
        const data = await productsAPI.getHistory();
        const historyArray = data.history || data;
        setHistory(Array.isArray(historyArray) ? historyArray : []);
      }
    } catch (error) {
      console.error("Error fetching product history:", error);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchLowStock = async () => {
    try {
      setLowStockLoading(true);
      if (guestMode) {
        const demoData = JSON.parse(localStorage.getItem("guest_inventory")) || [];
        const low = demoData.filter((p) => p.quantity <= (p.lowStockThreshold ?? 5));
        setLowStock(low);
      } else {
        const data = await productsAPI.getLowStock();
        const lowStockArray = data.products || data;
        setLowStock(Array.isArray(lowStockArray) ? lowStockArray : []);
      }
    } catch (error) {
      console.error("Error fetching low stock products:", error);
      setLowStock([]);
    } finally {
      setLowStockLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedBarcode = formData.barcode.trim();
    const trimmedProductNumber = formData.productNumber.trim();

    const resolvedProductNumber = trimmedProductNumber === ""
      ? (editingProduct?.productNumber ?? undefined)
      : trimmedProductNumber;

    const productData = {
      name: formData.name,
      barcode: trimmedBarcode === "" ? undefined : trimmedBarcode,
      brand: formData.brand,
      category: formData.category,
      quantity: parseInt(formData.quantity, 10),
      costPrice: parseFloat(formData.costPrice),
      sellingPrice: parseFloat(formData.sellingPrice),
      lowStockThreshold: formData.lowStockThreshold === "" ? undefined : parseFloat(formData.lowStockThreshold)
    };

    if (resolvedProductNumber !== undefined) {
      productData.productNumber = resolvedProductNumber;
    }

    try {
      if (guestMode) {
        // Guest mode: limit to 2 items total
        const current = JSON.parse(localStorage.getItem("guest_inventory")) || [];
        const isEditing = Boolean(editingProduct);
        if (!isEditing && current.length >= 2) {
          const goSignup = window.confirm("Guest mode allows up to 2 items. Sign up now to add more?");
          if (goSignup) {
            navigate("/signup");
          }
          return;
        }

        let updated;
        if (isEditing) {
          updated = current.map((p) =>
            (p._id || p.id) === (editingProduct._id || editingProduct.id) ? { ...p, ...productData } : p
          );
        } else {
          const id = `guest-${Date.now()}`;
          updated = [...current, { ...productData, id }];
          const nextCount = guestCount + 1;
          setGuestCount(nextCount);
          localStorage.setItem("guest_inventory_count", String(nextCount));
        }
        localStorage.setItem("guest_inventory", JSON.stringify(updated));
        setEditingProduct(null);
      } else {
        if (editingProduct) {
          await productsAPI.update(editingProduct._id || editingProduct.id, productData);
          setEditingProduct(null);
        } else {
          await productsAPI.create(productData);
        }
      }

      await fetchProducts();
      await fetchHistory();
      await fetchLowStock();

      setFormData(buildFormState());
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

  const handleStartCreate = () => {
    setEditingProduct(null);
    setFormData(buildFormState());
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData(buildFormState({
      name: product.name,
      productNumber: product.productNumber || "",
      barcode: product.barcode || "",
      brand: product.brand || "",
      category: product.category,
      quantity: product.quantity.toString(),
      costPrice: product.costPrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      lowStockThreshold: (product.lowStockThreshold ?? 5).toString()
    }));
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        if (guestMode) {
          const current = JSON.parse(localStorage.getItem("guest_inventory")) || [];
          const updated = current.filter((p) => (p._id || p.id) !== id);
          localStorage.setItem("guest_inventory", JSON.stringify(updated));
        } else {
          await productsAPI.delete(id);
        }
        await fetchProducts();
        await fetchHistory();
        await fetchLowStock();
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product. Please try again.");
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData(buildFormState());
  };

  const handleBackToDashboard = () => {
    if (guestMode) {
      navigate("/");
    } else {
      navigate("/dashboard");
    }
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
      <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center text-slate-200">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-cyan-400"></div>
          <p className="text-sm text-slate-400">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0b0b] text-slate-100">

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="rounded-2xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl shadow-[0_24px_120px_-50px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/12 bg-[#0d0e12] text-gray-50 shadow-[0_12px_36px_-18px_rgba(0,0,0,0.85)]">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 7.5h9.5a3 3 0 0 1 0 6H10a3 3 0 0 0 0 6h9" />
                  <circle cx="5" cy="7.5" r="1.6" />
                  <circle cx="10" cy="16.5" r="1.6" />
                  <circle cx="19" cy="13.5" r="1.6" />
                </svg>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Inventory</p>
                <h1 className="text-2xl font-semibold text-slate-50">Products & Stock</h1>
              </div>
            </div>
            <button
              onClick={handleBackToDashboard}
              className="btn-secondary px-4 py-2 text-sm"
            >
              ← Back to Dashboard
            </button>
          </div>
        </header>

        <main className="space-y-6">
          {guestMode && (
            <div className="rounded-2xl border border-cyan-500/40 bg-cyan-500/10 backdrop-blur-xl px-4 py-3 shadow-[0_18px_80px_-45px_rgba(34,211,238,0.35)] ring-1 ring-cyan-300/30 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-cyan-100/90">
                Guest mode lets you try inventory with up to 2 items. Sign up to unlock unlimited products and history.
              </div>
              <button
                onClick={() => navigate("/signup")}
                className="btn-primary px-4 py-2 text-xs sm:text-sm"
              >
                Sign Up Free
              </button>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-50">Products List</h2>
              <p className="text-sm text-slate-400">
                {guestMode
                  ? "Guest mode: add up to 2 items. Sign up to unlock full inventory."
                  : "Manage stock, pricing, and categories."}
              </p>
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
                {!guestMode && (
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
                )}
              </div>
              <button
                onClick={() => {
                  if (showForm) {
                    handleCancel();
                  } else {
                    handleStartCreate();
                  }
                }}
                className="btn-primary px-5 py-2 text-sm"
              >
                {showForm ? "Cancel" : "+ Add New Product"}
              </button>
            </div>
          </div>

          {lowStockLoading ? (
            <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4 text-sm text-slate-300">Checking stock levels...</div>
          ) : lowStock.length > 0 ? (
            <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 backdrop-blur-xl p-4 shadow-[0_18px_80px_-45px_rgba(251,191,36,0.35)] ring-1 ring-amber-300/30">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-amber-200/80">Low stock alert</p>
                  <h3 className="text-lg font-semibold text-amber-50">{lowStock.length} product{lowStock.length === 1 ? "" : "s"} need restock</h3>
                  <p className="text-sm text-amber-100/80">Restock these items before they run out.</p>
                </div>
                <div className="rounded-xl bg-amber-400/20 px-3 py-2 text-xs font-semibold text-amber-50">
                  Threshold per item
                </div>
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {lowStock.slice(0, 6).map((item) => {
                  const threshold = item.lowStockThreshold ?? 5;
                  return (
                    <div key={item._id || item.id} className="rounded-xl border border-amber-300/40 bg-amber-400/5 px-4 py-3 text-sm text-amber-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-amber-100/80">Qty: {item.quantity}</p>
                        </div>
                        <span className="rounded-full bg-amber-300/20 px-3 py-1 text-xs font-semibold text-amber-50">Threshold {threshold}</span>
                      </div>
                      <p className="text-amber-100/70 text-xs mt-1">Category: {item.category || "N/A"}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

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
                    disabled={Boolean(editingProduct)}
                    className="w-full rounded-xl border border-slate-800/70 bg-slate-800/70 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-500/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:text-slate-400"
                    placeholder={editingProduct ? "Product number cannot be changed" : "Leave blank to auto-generate per user"}
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Barcode</label>
                  <input
                    type="text"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-800/70 bg-slate-800/70 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-500/30"
                    placeholder="Scan or enter barcode"
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
                  <label className="block text-sm text-slate-300 mb-2">Low Stock Threshold</label>
                  <input
                    type="number"
                    name="lowStockThreshold"
                    value={formData.lowStockThreshold}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    className="w-full rounded-xl border border-slate-800/70 bg-slate-800/70 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-500/30"
                    placeholder="Alert me at quantity"
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
                    className="btn-primary px-5 py-2.5 text-sm"
                  >
                    {editingProduct ? "Update Product" : "Add Product"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-secondary px-5 py-2.5 text-sm"
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
                          <th className="px-6 py-3 text-left font-semibold">Barcode</th>
                          <th className="px-6 py-3 text-left font-semibold">Brand</th>
                          <th className="px-6 py-3 text-left font-semibold">Category</th>
                          <th className="px-6 py-3 text-left font-semibold">Quantity</th>
                          <th className="px-6 py-3 text-left font-semibold">Threshold</th>
                          <th className="px-6 py-3 text-left font-semibold">Cost Price</th>
                          <th className="px-6 py-3 text-left font-semibold">Selling Price</th>
                          <th className="px-6 py-3 text-left font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70">
                        {displayedProducts.map((product) => {
                          const threshold = product.lowStockThreshold ?? 5;
                          const isLowStock = product.quantity <= threshold;
                          return (
                            <tr
                              key={product._id || product.id}
                              className={`hover:bg-slate-800/50 ${isLowStock ? 'bg-amber-500/5' : ''}`}
                            >
                              <td className="px-6 py-3 text-slate-100">{product.name}</td>
                              <td className="px-6 py-3 text-slate-300">{product.productNumber || "-"}</td>
                              <td className="px-6 py-3 text-slate-300">{product.barcode || "-"}</td>
                              <td className="px-6 py-3 text-slate-300">{product.brand || "-"}</td>
                              <td className="px-6 py-3 text-slate-300">{product.category}</td>
                              <td className={`px-6 py-3 ${isLowStock ? 'text-amber-300 font-semibold' : 'text-slate-300'}`}>{product.quantity}</td>
                              <td className="px-6 py-3 text-slate-300">{threshold}</td>
                              <td className="px-6 py-3 text-slate-300">LKR {product.costPrice.toFixed(2)}</td>
                              <td className="px-6 py-3 text-slate-300">LKR {product.sellingPrice.toFixed(2)}</td>
                              <td className="px-6 py-3 flex gap-3 text-slate-200">
                                <button
                                  onClick={() => handleEdit(product)}
                                  className="btn-ghost px-3 py-1.5 text-xs font-semibold"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(product._id || product.id)}
                                  className="btn-danger px-3 py-1.5 text-xs font-semibold"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
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

          {activeTab === "history" && !guestMode && (
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
