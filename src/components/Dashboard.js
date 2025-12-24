import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import { clearUserData, getUserData } from '../utils/auth';
import { dashboardAPI } from '../utils/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
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

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    totalExpenses: 0
  });
  const [chartData, setChartData] = useState({
    dailySales: null,
    expensesByCategory: null,
    revenueVsExpenses: null
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all dashboard data in parallel
      const [statsData, dailySalesData, expensesCategoryData, revenueExpensesData] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getDailySales(),
        dashboardAPI.getExpensesByCategory(),
        dashboardAPI.getRevenueVsExpenses()
      ]);

      // Update stats
      setStats({
        totalProducts: statsData.totalProducts,
        totalRevenue: statsData.totalRevenue,
        totalExpenses: statsData.totalExpenses
      });

      // Process daily sales data
      const dailySalesLabels = dailySalesData.map(d => `Day ${d.day}`);
      const dailySalesValues = dailySalesData.map(d => d.revenue);

      // Process expenses by category
      const expenseCategories = expensesCategoryData.map(e => e.category);
      const expenseAmounts = expensesCategoryData.map(e => e.amount);

      // Process revenue vs expenses
      const months = revenueExpensesData.map(m => m.month);
      const revenueData = revenueExpensesData.map(m => m.revenue);
      const expensesData = revenueExpensesData.map(m => m.expenses);

      setChartData({
        dailySales: {
          labels: dailySalesLabels,
          datasets: [{
            label: 'Daily Sales (LKR)',
            data: dailySalesValues,
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          }]
        },
        expensesByCategory: expenseCategories.length > 0 ? {
          labels: expenseCategories,
          datasets: [{
            label: 'Expenses by Category (LKR)',
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
              label: 'Revenue (LKR)',
              data: revenueData,
              backgroundColor: 'rgba(34, 197, 94, 0.8)',
              borderColor: 'rgba(34, 197, 94, 1)',
              borderWidth: 1
            },
            {
              label: 'Expenses (LKR)',
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
      // Don't set error state here, just log it
      // Dashboard can still be shown with empty data
    }
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch("http://localhost:5000/api/auth/me", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
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

  const handleNavigation = (path) => {
    if (path === "Inventory") {
      navigate("/inventory");
    } else if (path === "Sales") {
      navigate("/sales");
    } else if (path === "Expenses") {
      navigate("/expenses");
    } else if (path === "Reports") {
      navigate("/reports");
    } else {
      alert(`Navigation to ${path} - Feature coming soon!`);
    }
  };

  // Function to get theme colors based on shop category
  const getThemeColors = (category) => {
    const themes = {
      "Computer Shop": {
        header: "bg-blue-600",
        stats: "text-blue-600",
        primary: "bg-blue-600",
        primaryHover: "hover:bg-blue-700",
        primaryText: "text-blue-600",
        primaryBorder: "border-blue-600",
        light: "bg-blue-50",
        lightHover: "hover:bg-blue-100",
        lightBorder: "hover:border-blue-500",
        gradient: "from-blue-500 to-blue-700"
      },
      "Grocery Store": {
        header: "bg-green-600",
        stats: "text-green-600",
        primary: "bg-green-600",
        primaryHover: "hover:bg-green-700",
        primaryText: "text-green-600",
        primaryBorder: "border-green-600",
        light: "bg-green-50",
        lightHover: "hover:bg-green-100",
        lightBorder: "hover:border-green-500",
        gradient: "from-green-500 to-green-700"
      },
      "Clothing Store": {
        header: "bg-pink-600",
        stats: "text-pink-600",
        primary: "bg-pink-600",
        primaryHover: "hover:bg-pink-700",
        primaryText: "text-pink-600",
        primaryBorder: "border-pink-600",
        light: "bg-pink-50",
        lightHover: "hover:bg-pink-100",
        lightBorder: "hover:border-pink-500",
        gradient: "from-pink-500 to-pink-700"
      }
    };

    // Return default theme (blue) if category not found
    return themes[category] || themes["Computer Shop"];
  };

  const themeColors = getThemeColors(user?.category);

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

  // Dummy data for stats
  const statsDisplay = [
    { label: "Total Products", value: stats.totalProducts.toString(), icon: "📦", color: "bg-blue-500" },
    { label: "Total Sales", value: `LKR ${stats.totalRevenue.toFixed(2)}`, icon: "💰", color: "bg-green-500" },
    { label: "Total Expenses", value: `LKR ${stats.totalExpenses.toFixed(2)}`, icon: "💸", color: "bg-red-500" }
  ];

  const menuItems = [
    { label: "Inventory", icon: "📦", action: () => handleNavigation("Inventory") },
    { label: "Sales", icon: "💵", action: () => handleNavigation("Sales") },
    { label: "Expenses", icon: "💸", action: () => handleNavigation("Expenses") },
    { label: "Reports", icon: "📊", action: () => handleNavigation("Reports") },
    { label: "Logout", icon: "🚪", action: handleLogout }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className={`${themeColors.header} text-white shadow-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Shop Management Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome, {user?.name || "User"}! 👋
          </h2>
          <p className="text-lg text-gray-600">
            Shop Category: <span className={`font-semibold ${themeColors.primaryText}`}>{user?.category || user?.shopCategory || "N/A"}</span>
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statsDisplay.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
                  <p className={`text-3xl font-bold ${themeColors.stats}`}>{stat.value}</p>
                </div>
                <div className={`${stat.color} text-white text-4xl p-3 rounded-full`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Menu */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button onClick={() => navigate("/inventory")} className="bg-blue-500 text-white p-4 rounded shadow hover:bg-blue-600">
              Inventory
            </button>
            <button onClick={() => navigate("/sales")} className="bg-green-500 text-white p-4 rounded shadow hover:bg-green-600">
              Sales
            </button>
            <button onClick={() => navigate("/expenses")} className="bg-red-500 text-white p-4 rounded shadow hover:bg-red-600">
              Expenses
            </button>
            <button onClick={() => navigate("/reports")} className="bg-purple-500 text-white p-4 rounded shadow hover:bg-purple-600">
              Reports
            </button>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mt-8 space-y-8">
          {/* Daily Sales Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Daily Sales - Current Month</h3>
            <div className="h-80">
              {chartData.dailySales && (
                <Bar 
                  data={chartData.dailySales}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: true,
                        text: 'Daily Sales Overview'
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>

          {/* Expenses by Category and Revenue vs Expenses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Expenses by Category Pie Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Expenses by Category</h3>
              <div className="h-80 flex items-center justify-center">
                {chartData.expensesByCategory ? (
                  <Pie 
                    data={chartData.expensesByCategory}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                        title: {
                          display: true,
                          text: 'Expense Distribution'
                        }
                      }
                    }}
                  />
                ) : (
                  <p className="text-gray-500">No expense data available</p>
                )}
              </div>
            </div>

            {/* Revenue vs Expenses Bar Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Revenue vs Expenses</h3>
              <div className="h-80">
                {chartData.revenueVsExpenses && (
                  <Bar 
                    data={chartData.revenueVsExpenses}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: true,
                          text: 'Monthly Comparison'
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;