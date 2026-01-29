import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearUserData, isGuestMode } from '../utils/auth';
import { salesAPI, productsAPI } from '../utils/api';

const EditIcon = ({ className = "" }) => (
  <svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className={className}
  >
    <path d="M4 12.5V15h2.5L14.75 6.75a1 1 0 0 0 0-1.5l-1-1a1 1 0 0 0-1.5 0L4 12.5Z" />
    <path d="M11.5 5.5 14 8" />
  </svg>
);

const DeleteIcon = ({ className = "" }) => (
  <svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className={className}
  >
    <path d="M6 6h8" />
    <path d="M8 6V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1" />
    <path d="M7.5 6h5l-.5 10h-4l-.5-10Z" />
  </svg>
);

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([{ productId: "", quantity: "" }]);
  const [editSaleId, setEditSaleId] = useState(null);
  const [saleDate, setSaleDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [sellingMethod, setSellingMethod] = useState('pos');
  const [customerName, setCustomerName] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const guest = isGuestMode();
    setIsGuest(guest);

    if (guest) {
      seedGuestData();
      return;
    }

    // Load sales and products from backend API
    fetchSalesAndProducts();
    // Restore recent activity log from localStorage (best-effort only)
    const cachedLog = localStorage.getItem('salesActivityLog');
    if (cachedLog) {
      try {
        const parsed = JSON.parse(cachedLog);
        if (Array.isArray(parsed)) {
          setActivityLog(parsed);
        }
      } catch (err) {
        console.warn('Failed to parse sales activity log cache', err);
      }
    }
  }, []);

  const seedGuestData = () => {
    const demoProducts = [
      {
        _id: "demo-1",
        productNumber: "SN-204",
        name: "Carbon Fiber Sneaker",
        brand: "Nova",
        category: "Footwear",
        sellingPrice: 129,
        costPrice: 80,
        quantity: 48,
      },
      {
        _id: "demo-2",
        productNumber: "BG-118",
        name: "Everyday Tote",
        brand: "Nova",
        category: "Accessories",
        sellingPrice: 58,
        costPrice: 32,
        quantity: 92,
      },
      {
        _id: "demo-3",
        productNumber: "WT-303",
        name: "Minimal Watch",
        brand: "Nova",
        category: "Watches",
        sellingPrice: 199,
        costPrice: 130,
        quantity: 35,
      },
    ];

    const demoSales = [
      {
        _id: "demo-sale-1",
        saleNumber: 1045,
        date: new Date().toISOString(),
        sellingMethod: "web",
        customerName: "Alex R.",
        products: [
          {
            productId: "demo-1",
            productName: "Carbon Fiber Sneaker",
            productNumber: "SN-204",
            category: "Footwear",
            quantity: 2,
            sellingPrice: 129,
            costPrice: 80,
          },
        ],
        totalRevenue: 258,
        totalProfit: 98,
      },
      {
        _id: "demo-sale-2",
        saleNumber: 1044,
        date: new Date(Date.now() - 86400000).toISOString(),
        sellingMethod: "pos",
        customerName: "Dakota S.",
        products: [
          {
            productId: "demo-2",
            productName: "Everyday Tote",
            productNumber: "BG-118",
            category: "Accessories",
            quantity: 3,
            sellingPrice: 58,
            costPrice: 32,
          },
          {
            productId: "demo-3",
            productName: "Minimal Watch",
            productNumber: "WT-303",
            category: "Watches",
            quantity: 1,
            sellingPrice: 199,
            costPrice: 130,
          },
        ],
        totalRevenue: 373,
        totalProfit: 139,
      },
    ];

    setProducts(demoProducts);
    setSales(demoSales);
    setShowForm(false);
    setActivityLog([
      {
        id: "demo-activity-1",
        type: "create",
        saleNumber: 1045,
        customer: "Alex R.",
        method: "web",
        detail: "Recorded demo sale",
        at: new Date().toISOString(),
      },
      {
        id: "demo-activity-2",
        type: "create",
        saleNumber: 1044,
        customer: "Dakota S.",
        method: "pos",
        detail: "Recorded demo sale",
        at: new Date(Date.now() - 7200000).toISOString(),
      },
    ]);
    setLoading(false);
  };

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

    if (isGuest) {
      alert("Guest mode is read-only. Sign up to record sales.");
      return;
    }

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

    // Create sale record with product details; fail fast if a product was not found
    const saleProducts = validProducts.map((sp) => {
      const product = products.find((p) => p._id === sp.productId || p.id === parseInt(sp.productId));

      if (!product) {
        throw new Error('Selected product was not found. Please refresh the page and try again.');
      }

      return {
        productId: sp.productId,
        productNumber: product.productNumber || '',
        brand: product.brand || '',
        productName: product.name,
        category: product.category,
        quantity: parseInt(sp.quantity),
        sellingPrice: product.sellingPrice,
        costPrice: product.costPrice
      };
    });

    const parsedDate = saleDate ? new Date(`${saleDate}T00:00:00`) : new Date();

    const newSale = {
      date: parsedDate.toISOString(),
      products: saleProducts,
      totalRevenue,
      totalProfit,
      sellingMethod,
      customerName
    };

    try {
      if (editSaleId) {
        // Update existing sale
        const previousSale = sales.find((s) => (s._id || s.id) === editSaleId);
        await salesAPI.update(editSaleId, newSale);
        // Do not attempt inventory reconciliation here
        await fetchSalesAndProducts();
        setEditSaleId(null);
        setSelectedProducts([{ productId: "", quantity: "" }]);
        setSaleDate(new Date().toISOString().slice(0, 10));
        setSellingMethod('pos');
        setShowForm(false);
        recordActivity({
          type: 'edit',
          saleNumber: previousSale?.saleNumber || previousSale?._id || previousSale?.id || editSaleId,
          customer: previousSale?.customerName || customerName || '-',
          method: previousSale?.sellingMethod || sellingMethod,
          detail: `Updated sale with ${validProducts.length} product(s)`
        });
        alert("Sale updated successfully!");
      } else {
        // Use backend selling method to create sale and update inventory atomically
        const productsPayload = saleProducts.map((p) => ({
          productId: p.productId,
          quantity: p.quantity,
          sellingPrice: p.sellingPrice
        }));

        // include sellingMethod, date and customerName when calling add
        const saleResponse = await salesAPI.add(productsPayload, { sellingMethod, date: newSale.date, customerName });

        // Refresh data from backend
        await fetchSalesAndProducts();

        // Reset form
        setSelectedProducts([{ productId: "", quantity: "" }]);
        setSaleDate(new Date().toISOString().slice(0, 10));
        setSellingMethod('pos');
        setCustomerName('');
        setShowForm(false);
        if (saleResponse?.lowStockAlerts?.length) {
          const names = saleResponse.lowStockAlerts.map((p) => `${p.name} (qty ${p.quantity}/${p.threshold})`).join(', ');
          alert(`Sale recorded. Low stock alert for: ${names}`);
        } else {
          alert("Sale recorded successfully!");
        }
      }
    } catch (error) {
      console.error('Error recording sale:', error);
      const serverMessage = error.response?.data?.error || error.message || 'Unknown error';
      alert(`Failed to record sale. ${serverMessage}`);
    }
  };

  const handleEdit = (sale) => {
    if (isGuest) {
      alert("Guest mode is read-only. Sign up to edit sales.");
      return;
    }
    // Populate form with sale data for editing
    const rows = (sale.products || []).map((p) => ({ productId: p.productId, quantity: p.quantity }));
    setSelectedProducts(rows.length > 0 ? rows : [{ productId: "", quantity: "" }]);
    setEditSaleId(sale._id || sale.id);
    setSaleDate(sale.date ? new Date(sale.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
    setSellingMethod(sale.sellingMethod || 'pos');
    setCustomerName(sale.customerName || '');
    setShowForm(true);
  };

  const handleDelete = async (saleId) => {
    if (isGuest) {
      alert("Guest mode is read-only. Sign up to delete sales.");
      return;
    }
    if (!window.confirm('Are you sure you want to delete this sale?')) return;
    try {
      const removedSale = sales.find((s) => (s._id || s.id) === saleId);
      await salesAPI.delete(saleId);
      await fetchSalesAndProducts();
      recordActivity({
        type: 'delete',
        saleNumber: removedSale?.saleNumber || removedSale?._id || removedSale?.id || saleId,
        customer: removedSale?.customerName || '-',
        method: removedSale?.sellingMethod || '-',
        detail: 'Sale deleted'
      });
      alert('Sale deleted');
    } catch (err) {
      console.error('Error deleting sale:', err);
      alert('Failed to delete sale');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedProducts([{ productId: "", quantity: "" }]);
    setSaleDate(new Date().toISOString().slice(0, 10));
    setSellingMethod('pos');
    setCustomerName('');
    setEditSaleId(null);
    setBarcodeInput('');
  };

  const handleLogout = () => {
    if (isGuest) {
      localStorage.removeItem("guest_mode");
      navigate("/");
      return;
    }
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

  const recordActivity = (entry) => {
    const next = [
      {
        ...entry,
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        at: new Date().toISOString()
      },
      ...activityLog
    ].slice(0, 50); // keep log small
    setActivityLog(next);
    localStorage.setItem('salesActivityLog', JSON.stringify(next));
  };


  const formatCurrency = (amount) => {
    return `LKR ${amount.toFixed(2)}`;
  };

  // Handle barcode scans/entries to add products quickly
  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    if (isGuest) {
      alert("Guest mode is read-only. Sign up to use barcode scanning.");
      return;
    }

    try {
      const response = await productsAPI.getByBarcode(code);
      const product = response.product || response;

      if (!product?._id && !product?.id) {
        throw new Error('Product not found for this barcode');
      }

      const productId = product._id || product.id;

      setProducts((prev) => {
        const exists = prev.some((p) => (p._id || p.id) === productId);
        return exists ? prev : [...prev, product];
      });

      setSelectedProducts((prev) => {
        const idx = prev.findIndex((p) => p.productId === productId);
        if (idx >= 0) {
          const updated = [...prev];
          const currentQty = parseInt(updated[idx].quantity || '0', 10) || 0;
          updated[idx] = { ...updated[idx], quantity: (currentQty + 1).toString() };
          return updated;
        }
        return [...prev, { productId, quantity: '1' }];
      });

      if (!showForm) {
        setShowForm(true);
      }
    } catch (err) {
      console.error('Barcode lookup failed:', err);
      const message = err.response?.data?.error || err.message || 'Unable to find product for this barcode';
      alert(message);
    } finally {
      setBarcodeInput('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center text-slate-200">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-cyan-400"></div>
          <p className="text-sm text-slate-400">Loading...</p>
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
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Sales</p>
                <h1 className="text-2xl font-semibold text-slate-50">Sales Management</h1>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="btn-secondary px-4 py-2 text-sm"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="btn-secondary px-4 py-2 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-50">Sales Records</h2>
              <p className="text-sm text-slate-400">Log sales, track revenue, and stay on stock.</p>
            </div>
            <button
              onClick={() => {
                if (!showForm) {
                  // preparing a fresh form for new sale
                  setEditSaleId(null);
                  setSelectedProducts([{ productId: "", quantity: "" }]);
                  setSaleDate(new Date().toISOString().slice(0, 10));
                  setSellingMethod('pos');
                  setCustomerName('');
                }
                setShowForm(!showForm);
              }}
              className="btn-primary px-5 py-2 text-sm"
            >
              {showForm ? "Cancel" : "Record New Sale"}
            </button>
          </div>

          {showForm && (
            <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl p-6 shadow-[0_18px_80px_-45px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
              <h2 className="text-lg font-semibold text-slate-50 mb-4">Record New Sale</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
                  <div className="flex-1">
                    <label className="block text-sm text-slate-300 mb-2">Barcode Scan</label>
                    <input
                      type="text"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleBarcodeSubmit(e);
                        }
                      }}
                      placeholder="Scan barcode to add product"
                      className="w-full rounded-xl border border-slate-800/70 bg-slate-800/70 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-500/30"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleBarcodeSubmit}
                    className="sm:mt-[26px] inline-flex items-center justify-center btn-primary px-4 py-2.5 text-sm"
                  >
                    Add via Barcode
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Sale Date</label>
                    <input
                      type="date"
                      value={saleDate}
                      onChange={(e) => setSaleDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-800/70 bg-slate-800/70 px-4 py-2.5 text-slate-100 focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-500/30"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Selling Method</label>
                    <select
                      value={sellingMethod}
                      onChange={(e) => setSellingMethod(e.target.value)}
                      className="w-full rounded-xl border border-slate-800/70 bg-slate-800/70 px-4 py-2.5 text-slate-100 focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-500/30"
                      required
                    >
                      <option value="pos">POS</option>
                      <option value="web">Web</option>
                      <option value="wholesale">Wholesale</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Customer Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Customer name (optional)"
                      className="w-full rounded-xl border border-slate-800/70 bg-slate-800/70 px-4 py-2.5 text-slate-100 focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-500/30"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedProducts.map((sp, index) => (
                    <div key={index} className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                      <div className="flex-1">
                        <label className="block text-sm text-slate-300 mb-2">Product</label>
                        <select
                          value={sp.productId}
                          onChange={(e) => handleProductChange(index, "productId", e.target.value)}
                          className="w-full rounded-xl border border-slate-800/70 bg-slate-800/70 px-4 py-2.5 text-slate-100 focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-500/30"
                          required
                        >
                          <option value="">Select a product</option>
                          {products.map((product) => (
                            <option key={product._id || product.id} value={product._id || product.id}>
                              {product.name} · Stock {product.quantity} · LKR {product.sellingPrice}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-full sm:w-32">
                        <label className="block text-sm text-slate-300 mb-2">Quantity</label>
                        <input
                          type="number"
                          value={sp.quantity}
                          onChange={(e) => handleProductChange(index, "quantity", e.target.value)}
                          min="1"
                          className="w-full rounded-xl border border-slate-800/70 bg-slate-800/70 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-500/30"
                          placeholder="Qty"
                          required
                        />
                      </div>

                      {selectedProducts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveProductRow(index)}
                          className="sm:mt-8 inline-flex items-center justify-center btn-danger px-3 py-2 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddProductRow}
                    className="btn-secondary px-4 py-2 text-sm"
                  >
                    + Add Another Product
                  </button>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className="btn-primary px-5 py-2.5 text-sm"
                  >
                    Record Sale
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

          <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl shadow-[0_18px_80px_-45px_rgba(15,23,42,0.9)] ring-1 ring-white/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800/60">
              <h2 className="text-lg font-semibold text-slate-50">Sales History</h2>
            </div>

            {sales.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-400">
                No sales recorded yet. Click "Record New Sale" to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-800/80 text-slate-300">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold">Sale #</th>
                      <th className="px-6 py-3 text-left font-semibold">Date</th>
                      <th className="px-6 py-3 text-left font-semibold">Method</th>
                      <th className="px-6 py-3 text-left font-semibold">Customer</th>
                      <th className="px-6 py-3 text-left font-semibold">Products</th>
                      <th className="px-6 py-3 text-left font-semibold">Total Revenue</th>
                      <th className="px-6 py-3 text-left font-semibold">Total Profit</th>
                      <th className="px-6 py-3 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {sales.map((sale, index) => {
                      const displayNumber = sale.saleNumber ?? index + 1;
                      return (
                        <tr key={sale._id || sale.id} className="hover:bg-slate-800/50">
                          <td className="px-6 py-4 text-slate-100 whitespace-nowrap">#{displayNumber}</td>
                          <td className="px-6 py-4 text-slate-100 whitespace-nowrap">{formatDate(sale.date)}</td>
                          <td className="px-6 py-4 text-slate-300 whitespace-nowrap">{(sale.sellingMethod || 'pos').charAt(0).toUpperCase() + (sale.sellingMethod || 'pos').slice(1)}</td>
                          <td className="px-6 py-4 text-slate-300 whitespace-nowrap">{sale.customerName || '-'}</td>
                          <td className="px-6 py-4 text-slate-300">
                            <div className="space-y-1">
                              {sale.products.map((product, idx) => (
                                <div key={idx}>
                                  {product.productName} x {product.quantity}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-emerald-300 font-semibold whitespace-nowrap">
                            {formatCurrency(sale.totalRevenue)}
                          </td>
                          <td className="px-6 py-4 text-cyan-300 font-semibold whitespace-nowrap">
                            {formatCurrency(sale.totalProfit)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(sale)}
                                className="btn-ghost inline-flex items-center px-3 py-1.5 text-xs font-semibold"
                              >
                                <EditIcon className="h-4 w-4 mr-1" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(sale._id || sale.id)}
                                className="btn-danger inline-flex items-center px-3 py-1.5 text-xs font-semibold"
                              >
                                <DeleteIcon className="h-4 w-4 mr-1" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {activityLog.length > 0 && (
            <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl shadow-[0_18px_80px_-45px_rgba(15,23,42,0.9)] ring-1 ring-white/5 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
                <div>
                  <h2 className="text-lg font-semibold text-slate-50">Edit/Delete Activity</h2>
                  <p className="text-sm text-slate-400">Recent changes to sales (local log)</p>
                </div>
                {/* Clear button removed to preserve edit/delete history */}
              </div>
              <div className="divide-y divide-slate-800/70">
                {activityLog.map((entry) => (
                  <div key={entry.id} className="px-6 py-4 flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${entry.type === 'delete' ? 'border-rose-500/40 text-rose-300 bg-rose-500/10' : 'border-cyan-400/40 text-cyan-200 bg-cyan-500/10'}`}>
                      {entry.type === 'delete' ? (
                        <DeleteIcon className="h-4 w-4" />
                      ) : (
                        <EditIcon className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-slate-50 font-semibold">
                        {entry.type === 'delete' ? 'Sale deleted' : 'Sale edited'} · {entry.saleNumber ? `#${entry.saleNumber}` : 'unknown'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {entry.detail || ''}
                        {entry.customer ? ` · Customer: ${entry.customer}` : ''}
                        {entry.method ? ` · Method: ${(entry.method || '').toString().toUpperCase()}` : ''}
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 whitespace-nowrap">{formatDate(entry.at)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sales.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4 shadow-[0_18px_80px_-45px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
                <p className="text-sm text-slate-400">Total Sales</p>
                <p className="text-2xl font-semibold text-slate-50">{sales.length}</p>
              </div>
              <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4 shadow-[0_18px_80px_-45px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
                <p className="text-sm text-slate-400">Total Revenue</p>
                <p className="text-2xl font-semibold text-emerald-300">
                  {formatCurrency(sales.reduce((sum, sale) => sum + sale.totalRevenue, 0))}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4 shadow-[0_18px_80px_-45px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
                <p className="text-sm text-slate-400">Total Profit</p>
                <p className="text-2xl font-semibold text-cyan-300">
                  {formatCurrency(sales.reduce((sum, sale) => sum + sale.totalProfit, 0))}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Sales;
