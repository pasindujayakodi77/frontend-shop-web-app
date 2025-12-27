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

// Use environment variable for API URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

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
    { label: "Monthly Revenue", value: `LKR ${stats.monthlyRevenue.toFixed(2)}`, icon: "💰" },
    { label: "Average Order Value", value: `LKR ${stats.averageOrderValue.toFixed(2)}`, icon: "🧾" },
    { label: "Net Margin", value: `${stats.netMarginPct.toFixed(1)}%`, icon: "📈" },
  ];

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
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Dashboard</p>
                <h1 className="text-2xl font-semibold text-slate-50">ShopFlow Control Center</h1>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-xl border border-slate-700/70 bg-slate-800/80 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-rose-400/60 hover:text-white focus-visible:ring-2 focus-visible:ring-rose-300"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="space-y-8">
          <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl p-6 shadow-[0_24px_120px_-50px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-semibold text-slate-50">Welcome, {user?.name || "User"}! 👋</h2>
              <p className="text-sm text-slate-400">Shop category: <span className="font-semibold text-cyan-300">{user?.category || user?.shopCategory || "N/A"}</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statsDisplay.map((stat, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-5 backdrop-blur-xl shadow-[0_18px_80px_-45px_rgba(15,23,42,0.9)] ring-1 ring-white/5"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.08em] text-slate-400">{stat.label}</p>
                    <p className="text-3xl font-semibold text-slate-50">{stat.value}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-emerald-400 text-slate-900 text-2xl shadow-lg shadow-cyan-500/30">
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl p-6 shadow-[0_18px_80px_-45px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Quick actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button onClick={() => navigate("/inventory")} className="rounded-xl border border-slate-800/70 bg-slate-800/60 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-cyan-400/60 hover:-translate-y-[1px] hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-300">
                Inventory
              </button>
              <button onClick={() => navigate("/sales")} className="rounded-xl border border-slate-800/70 bg-slate-800/60 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-cyan-400/60 hover:-translate-y-[1px] hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-300">
                Sales
              </button>
              <button onClick={() => navigate("/expenses")} className="rounded-xl border border-slate-800/70 bg-slate-800/60 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-cyan-400/60 hover:-translate-y-[1px] hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-300">
                Expenses
              </button>
              <button onClick={() => navigate("/reports")} className="rounded-xl border border-slate-800/70 bg-slate-800/60 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-cyan-400/60 hover:-translate-y-[1px] hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-300">
                Reports
              </button>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl p-6 shadow-[0_18px_80px_-45px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">Weekly Sales (last 7 days)</h3>
              <div className="h-80">
                {chartData.weeklySales && (
                  <Bar
                    data={chartData.weeklySales}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: "top", labels: { color: "#e2e8f0" } },
                        title: { display: false },
                      },
                      scales: {
                        x: { ticks: { color: "#cbd5e1" }, grid: { color: "rgba(148,163,184,0.2)" } },
                        y: { beginAtZero: true, ticks: { color: "#cbd5e1" }, grid: { color: "rgba(148,163,184,0.2)" } },
                      },
                    }}
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl p-6 shadow-[0_18px_80px_-45px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
                <h3 className="text-lg font-semibold text-slate-100 mb-4">Expenses by Category</h3>
                <div className="h-80 flex items-center justify-center">
                  {chartData.expensesByCategory ? (
                    <Pie
                      data={chartData.expensesByCategory}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: "bottom", labels: { color: "#e2e8f0" } },
                          title: { display: true, text: "Expense Distribution", color: "#e2e8f0" },
                        },
                      }}
                    />
                  ) : (
                    <p className="text-slate-400">No expense data available</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl p-6 shadow-[0_18px_80px_-45px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
                <h3 className="text-lg font-semibold text-slate-100 mb-4">Revenue vs Expenses</h3>
                <div className="h-80">
                  {chartData.revenueVsExpenses && (
                    <Bar
                      data={chartData.revenueVsExpenses}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: "top", labels: { color: "#e2e8f0" } },
                          title: { display: true, text: "Monthly Comparison", color: "#e2e8f0" },
                        },
                        scales: {
                          x: { ticks: { color: "#cbd5e1" }, grid: { color: "rgba(148,163,184,0.2)" } },
                          y: { beginAtZero: true, ticks: { color: "#cbd5e1" }, grid: { color: "rgba(148,163,184,0.2)" } },
                        },
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl p-6 shadow-[0_18px_80px_-45px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-100">Top Products</h3>
                  <span className="text-xs text-slate-400">By quantity sold</span>
                </div>
                <div className="space-y-3">
                  {lists.topProducts.length === 0 && (
                    <p className="text-slate-400 text-sm">No product sales yet</p>
                  )}
                  {lists.topProducts.map((product) => (
                    <div key={product.productId || product.name} className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-800/50 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{product.name}</p>
                        <p className="text-xs text-slate-400">Qty sold: {product.quantity}</p>
                      </div>
                      <div className="text-sm text-slate-200">{product.sellingPrice ? `LKR ${product.sellingPrice}` : ""}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl p-6 shadow-[0_18px_80px_-45px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-100">Recent Sales</h3>
                  <span className="text-xs text-slate-400">Latest 5 orders</span>
                </div>
                <div className="space-y-3">
                  {lists.recentSales.length === 0 && (
                    <p className="text-slate-400 text-sm">No sales recorded yet</p>
                  )}
                  {lists.recentSales.map((sale) => {
                    const saleId = String(sale._id || sale.id || 'unknown');
                    const orderLabel = sale.orderNumber || `#${saleId.slice(-4)}`;
                    const productName = sale.productName || 'N/A';
                    const category = sale.category || 'N/A';

                    return (
                      <div key={saleId} className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-800/50 px-4 py-3">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-100">Order {orderLabel}</p>
                          <p className="text-xs text-slate-400">{productName} • {category}</p>
                          <p className="text-xs text-slate-400">{sale.items} items • {new Date(sale.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-sm text-slate-50 font-semibold">LKR {sale.totalRevenue?.toFixed(2) || "0.00"}</div>
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