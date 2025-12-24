import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

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
      
      // If category is not in API response, check localStorage
      if (!data.category || !data.shopCategory) {
        const localCategory = localStorage.getItem("userCategory");
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
    localStorage.removeItem("token");
    alert("Logged out successfully.");
    window.location.href = "/login";
  };

  const handleNavigation = (path) => {
    if (path === "Inventory") {
      navigate("/inventory");
    } else if (path === "Sales") {
      navigate("/sales");
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
  const stats = [
    { label: "Total Products", value: "124", icon: "📦", color: "bg-blue-500" },
    { label: "Total Sales", value: "$12,450", icon: "💰", color: "bg-green-500" },
    { label: "Total Expenses", value: "$8,230", icon: "💸", color: "bg-red-500" }
  ];

  const menuItems = [
    { label: "Inventory", icon: "📦", action: () => handleNavigation("Inventory") },
    { label: "Sales", icon: "💵", action: () => handleNavigation("Sales") },
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
          {stats.map((stat, index) => (
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
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className={`p-4 rounded-lg border-2 border-gray-200 ${themeColors.lightBorder} ${themeColors.lightHover} transition duration-200 ${
                  item.label === "Logout" ? "hover:border-red-500 hover:bg-red-50" : ""
                }`}
              >
                <div className="text-4xl mb-2">{item.icon}</div>
                <div className="font-semibold text-gray-800">{item.label}</div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;