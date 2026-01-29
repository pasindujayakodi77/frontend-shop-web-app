import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import { clearUserData, getUserData } from "../utils/auth";
import { dashboardAPI } from "../utils/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Use environment variable for API URL; fallback to relative `/api` in deploys
const API_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace(/\/+$/, '') + '/api'
  : '/api';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    monthlyRevenue: 0,
    averageOrderValue: 0,
    netMarginPct: 0,
    productCount: 0,
    orderCount: 0
  });
  const [chartData, setChartData] = useState({
    weeklySales: null,
    expensesByCategory: null,
    revenueVsExpenses: null
  });
  const [lists, setLists] = useState({
    recentSales: [],
    topProducts: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const insights = await dashboardAPI.getInsights();

      setStats({
        monthlyRevenue: insights.monthlyRevenue || 0,
        averageOrderValue: insights.averageOrderValue || 0,
        netMarginPct: insights.netMarginPct || 0,
        productCount: insights.productCount || 0,
        orderCount: insights.orderCount || 0,
      });

      const weeklyLabels = (insights.weeklySales || []).map((d) => d.label);
      const weeklyTotals = (insights.weeklySales || []).map((d) => d.total);

      const expenseCategories = (insights.expenseMix || []).map((e) => e.category);
      const expenseAmounts = (insights.expenseMix || []).map((e) => e.amount);

      const revenueVsExpenses = insights.revenueVsExpenses || [];
      const months = revenueVsExpenses.map((m) => m.month);
      const revenueData = revenueVsExpenses.map((m) => m.revenue);
      const expensesData = revenueVsExpenses.map((m) => m.expenses);

      setLists({
        recentSales: insights.recentSales || [],
        topProducts: insights.topProducts || [],
      });

      setChartData({
        weeklySales: {
          labels: weeklyLabels,
          datasets: [
            {
              label: 'Weekly Sales',
              data: weeklyTotals,
              backgroundColor: 'rgba(59, 130, 246, 0.8)',
              borderColor: 'rgba(59, 130, 246, 1)',
              borderWidth: 1,
            },
          ],
        },
        expensesByCategory: expenseCategories.length > 0 ? {
          labels: expenseCategories,
          datasets: [{
            label: 'Expenses by Category',
            data: expenseAmounts,
            backgroundColor: [
              'rgba(239, 68, 68, 0.8)',
              'rgba(249, 115, 22, 0.8)',
              'rgba(234, 179, 8, 0.8)',
              'rgba(34, 197, 94, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(168, 85, 247, 0.8)'
            ],
            borderColor: [
              'rgba(239, 68, 68, 1)',
              'rgba(249, 115, 22, 1)',
              'rgba(234, 179, 8, 1)',
              'rgba(34, 197, 94, 1)',
              'rgba(59, 130, 246, 1)',
              'rgba(168, 85, 247, 1)'
            ],
            borderWidth: 1
          }]
        } : null,
        revenueVsExpenses: {
          labels: months,
          datasets: [
            {
              label: 'Revenue',
              data: revenueData,
              backgroundColor: 'rgba(34, 197, 94, 0.8)',
              borderColor: 'rgba(34, 197, 94, 1)',
              borderWidth: 1
            },
            {
              label: 'Expenses',
              data: expensesData,
              backgroundColor: 'rgba(239, 68, 68, 0.8)',
              borderColor: 'rgba(239, 68, 68, 1)',
              borderWidth: 1
            }
          ]
        }
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      
      // If category is not in API response, check user-specific localStorage
      if (!data.category || !data.shopCategory) {
        const localCategory = getUserData("userCategory");
        if (localCategory) {
          data.category = localCategory;
          data.shopCategory = localCategory;
        }
      }
      
      setUser(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearUserData();
    localStorage.removeItem("token");
    alert("Logged out successfully.");
    window.location.href = "/login";
  };

  const truncate = (text, max = 20) => {
    if (!text) return text;
    return text.length > max ? text.slice(0, max - 1) + '…' : text;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">Error: {error}</div>
      </div>
    );
  }

  const statsDisplay = [
    {
      label: "Monthly Revenue",
      value: `LKR ${stats.monthlyRevenue.toFixed(2)}`,
      iconBg: "from-emerald-400/30 via-emerald-500/60 to-emerald-600/60",
      icon: (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" />
          <path d="M4 7l3-3h10l3 3" />
          <path d="M12 11v4" />
          <path d="M9.5 13h5" />
        </svg>
      ),
    },
    {
      label: "Average Order Value",
      value: `LKR ${stats.averageOrderValue.toFixed(2)}`,
      iconBg: "from-cyan-400/30 via-sky-500/60 to-blue-500/60",
      icon: (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 4h12l-1.5 12.5a2 2 0 0 1-2 1.5H9.5a2 2 0 0 1-2-1.5L6 4z" />
          <path d="M9 8h6" />
          <path d="M10 12h4" />
          <path d="M9 20a1 1 0 1 0 0-2" />
          <path d="M15 20a1 1 0 1 0 0-2" />
        </svg>
      ),
    },
    {
      label: "Net Margin",
      value: `${stats.netMarginPct.toFixed(1)}%`,
      iconBg: "from-amber-400/30 via-orange-500/60 to-rose-500/60",
      icon: (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 18l6-6 4 4 6-6" />
          <path d="M20 6v6h-6" />
          <path d="M4 20h16" />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050506] text-gray-100">
      <div className="pointer-events-none absolute inset-0 select-none">
        <div className="absolute -top-44 -left-36 h-80 w-80 rounded-full bg-[#0f1116]/70 blur-3xl" />
        <div className="absolute -bottom-52 -right-28 h-96 w-96 rounded-full bg-[#0c0d11]/65 blur-[110px]" />
        <div className="absolute top-1/3 right-1/4 h-44 w-44 rotate-12 rounded-full bg-gradient-to-br from-[#16181f]/35 via-[#0d0e12]/35 to-[#0b0c10]/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.025),_transparent_35%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="rounded-2xl border border-white/10 bg-[#0b0c10]/75 backdrop-blur-xl shadow-[0_24px_120px_-50px_rgba(0,0,0,0.7)] ring-1 ring-white/5">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/12 bg-[#0d0e12] text-gray-50 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.8)]">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 7.5h9.5a3 3 0 0 1 0 6H10a3 3 0 0 0 0 6h9" />
                  <circle cx="5" cy="7.5" r="1.6" />
                  <circle cx="10" cy="16.5" r="1.6" />
                  <circle cx="19" cy="13.5" r="1.6" />
                </svg>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Dashboard</p>
                <h1 className="text-2xl font-semibold text-gray-50">ShopFlow Control Center</h1>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary px-4 py-2 text-sm"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="space-y-8">
          <div className="rounded-2xl border border-white/10 bg-[#0b0c10]/75 backdrop-blur-xl p-6 shadow-[0_24px_120px_-50px_rgba(0,0,0,0.7)] ring-1 ring-white/5">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-semibold text-gray-50">Welcome, {user?.name || "User"}! 👋</h2>
              <p className="text-sm text-gray-400">Shop category: <span className="font-semibold text-emerald-300">{user?.category || user?.shopCategory || "N/A"}</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statsDisplay.map((stat, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-[#0d0e12]/80 p-5 backdrop-blur-xl shadow-[0_18px_80px_-45px_rgba(0,0,0,0.65)] ring-1 ring-white/5"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.08em] text-gray-400">{stat.label}</p>
                    <p className="text-3xl font-semibold text-gray-50">{stat.value}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.iconBg} text-gray-50 shadow-lg shadow-black/40`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/80 backdrop-blur-xl p-6 shadow-[0_18px_80px_-45px_rgba(0,0,0,0.65)] ring-1 ring-white/5">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Quick actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button onClick={() => navigate("/inventory")} className="btn-secondary w-full px-4 py-3 text-sm font-medium hover:-translate-y-[1px]">
                Inventory
              </button>
              <button onClick={() => navigate("/sales")} className="btn-secondary w-full px-4 py-3 text-sm font-medium hover:-translate-y-[1px]">
                Sales
              </button>
              <button onClick={() => navigate("/expenses")} className="btn-secondary w-full px-4 py-3 text-sm font-medium hover:-translate-y-[1px]">
                Expenses
              </button>
              <button onClick={() => navigate("/reports")} className="btn-secondary w-full px-4 py-3 text-sm font-medium hover:-translate-y-[1px]">
                Reports
              </button>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/80 backdrop-blur-xl p-6 shadow-[0_18px_80px_-45px_rgba(0,0,0,0.65)] ring-1 ring-white/5">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">Weekly Sales (last 7 days)</h3>
              <div className="h-80">
                {chartData.weeklySales && (
                  <Bar
                    data={chartData.weeklySales}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: "top", labels: { color: "#e5e7eb" } },
                        title: { display: false },
                      },
                      scales: {
                        x: { ticks: { color: "#d1d5db" }, grid: { color: "rgba(255,255,255,0.06)" } },
                        y: { beginAtZero: true, ticks: { color: "#d1d5db" }, grid: { color: "rgba(255,255,255,0.06)" } },
                      },
                    }}
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/80 backdrop-blur-xl p-6 shadow-[0_18px_80px_-45px_rgba(0,0,0,0.65)] ring-1 ring-white/5">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Expenses by Category</h3>
                <div className="h-80 flex items-center justify-center">
                  {chartData.expensesByCategory ? (
                    <Pie
                      data={chartData.expensesByCategory}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: "bottom", labels: { color: "#e5e7eb" } },
                          title: { display: true, text: "Expense Distribution", color: "#e5e7eb" },
                        },
                      }}
                    />
                  ) : (
                    <p className="text-gray-400">No expense data available</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/80 backdrop-blur-xl p-6 shadow-[0_18px_80px_-45px_rgba(0,0,0,0.65)] ring-1 ring-white/5">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Revenue vs Expenses</h3>
                <div className="h-80">
                  {chartData.revenueVsExpenses && (
                    <Bar
                      data={chartData.revenueVsExpenses}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: "top", labels: { color: "#e5e7eb" } },
                          title: { display: true, text: "Monthly Comparison", color: "#e5e7eb" },
                        },
                        scales: {
                            x: { ticks: { color: "#d1d5db" }, grid: { color: "rgba(255,255,255,0.06)" } },
                            y: { beginAtZero: true, ticks: { color: "#d1d5db" }, grid: { color: "rgba(255,255,255,0.06)" } },
                        },
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-[#0d0e12]/80 backdrop-blur-xl p-6 shadow-[0_18px_80px_-45px_rgba(0,0,0,0.65)] ring-1 ring-white/5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-100">Top Products</h3>
                    <span className="text-xs text-gray-400">By quantity sold</span>
                </div>
                <div className="space-y-3">
                  {lists.topProducts.length === 0 && (
                      <p className="text-gray-400 text-sm">No product sales yet</p>
                  )}
                  {(() => {
                    const items = lists.topProducts || [];
                    const totalRevenue = items.reduce((s, p) => s + ((p.quantity || 0) * (p.sellingPrice || 0)), 0);
                    return items.map((product) => {
                      const pct = totalRevenue ? ((product.quantity * (product.sellingPrice || 0)) / totalRevenue) * 100 : 0;
                      return (
                          <div key={product.productId || product.name} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#101118]/70 px-4 py-3">
                          <div>
                              <p className="text-sm font-semibold text-gray-100">{product.name}</p>
                              <p className="text-xs text-gray-400">{product.productNumber || '-'}</p>
                              <p className="text-xs text-gray-400">Qty sold: {product.quantity}</p>
                          </div>
                          <div>
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-semibold">
                              {pct.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

                <div className="rounded-2xl border border-white/8 bg-[#0d0e12]/80 backdrop-blur-xl p-6 shadow-[0_18px_80px_-45px_rgba(0,0,0,0.65)] ring-1 ring-white/5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-100">Recent Sales</h3>
                    <span className="text-xs text-gray-400">Latest 5 orders</span>
                </div>
                <div className="space-y-3">
                  {lists.recentSales.length === 0 && (
                      <p className="text-gray-400 text-sm">No sales recorded yet</p>
                  )}
                  {lists.recentSales.map((sale) => {
                    const saleId = String(sale._id || sale.id || 'unknown');
                    const saleNumber = sale.saleNumber ? `#${sale.saleNumber}` : (sale.orderNumber || `#${saleId.slice(-4)}`);
                    const customerName = sale.customerName || sale.sellerName || sale.customer?.name || '-';
                    const sellingMethod = (sale.sellingMethod || 'pos');
                    const sellingMethodLabel = sellingMethod.charAt(0).toUpperCase() + sellingMethod.slice(1);

                    return (
                      <div key={saleId} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#101118]/70 px-4 py-3">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-gray-100">Sale {saleNumber}</p>
                          <p className="text-xs text-gray-400" title={customerName}>{truncate(customerName, 24)} • {sellingMethodLabel}</p>
                          <p className="text-xs text-gray-400">{sale.items} items • {new Date(sale.date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-gray-50 font-semibold">LKR {sale.totalRevenue?.toFixed(2) || "0.00"}</div>
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-semibold">Paid</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;