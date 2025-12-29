import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setUserData } from "../utils/auth";

// Use environment variable for API URL (fallback to localhost) and normalize trailing slash
const API_URL = `${(process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/+$/, "")}/api`;

const CategorySelection = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const categories = [
    "Computer Shop",
    "Grocery Store",
    "Clothing Store",
    "Pharmacy",
    "Restaurant",
  ];

  const handleCategorySelect = async (category) => {
    setLoading(true);
    setError("");
    setSelectedCategory(category);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication required. Please login.");
        navigate("/login");
        return;
      }

      try {
        const response = await axios.put(
          `${API_URL}/auth/update-category`,
          { shopCategory: category },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "x-auth-token": token,
            },
          }
        );

        if (response.data) {
          setUserData("userCategory", category);
          navigate("/dashboard");
        }
      } catch (err) {
        if (err.response?.status === 404 || err.response?.data?.error?.includes("Cannot")) {
          console.warn("Backend endpoint not available. Storing category locally.");
          setUserData("userCategory", category);
          navigate("/dashboard");
        } else if (
          err.response?.status === 401 ||
          err.response?.status === 403 ||
          err.response?.data?.error?.includes("access denied")
        ) {
          setError("Session expired or invalid. Please login again.");
          localStorage.removeItem("token");
          setTimeout(() => navigate("/login"), 2000);
        } else {
          throw err;
        }
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to update category. Please try again.";
      setError(errorMsg);
      console.error("Category update error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 select-none">
        <div className="absolute -top-40 -left-32 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-48 -right-24 h-80 w-80 rounded-full bg-emerald-500/16 blur-[110px]" />
        <div className="absolute top-1/3 right-1/4 h-40 w-40 rotate-12 rounded-full bg-gradient-to-br from-blue-600/25 via-cyan-500/25 to-emerald-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.04),_transparent_35%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-emerald-400 to-blue-700 shadow-lg shadow-cyan-500/40">
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6 text-slate-900"
              >
                <path
                  d="M4 6h2l1.5 9h9l1.5-6H7"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="10" cy="18" r="1" fill="currentColor" />
                <circle cx="16" cy="18" r="1" fill="currentColor" />
              </svg>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Set Category</p>
              <h1 className="text-3xl font-semibold text-slate-50">ShopFlow</h1>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur-xl shadow-[0_24px_120px_-40px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
            <div className="px-8 py-10 space-y-8">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-slate-50">Select your shop category</h2>
                <p className="text-sm text-slate-400">This helps personalize dashboards, defaults, and reports.</p>
              </div>

              {error && (
                <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    disabled={loading}
                    className={`group relative overflow-hidden rounded-2xl border px-5 py-5 text-left transition
                      ${selectedCategory === category ? "border-cyan-400/70 bg-slate-800/80 shadow-lg shadow-cyan-500/15" : "border-slate-700/70 bg-slate-900/60 hover:border-cyan-400/50 hover:bg-slate-800/70"}
                      ${loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                      focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-0`}
                  >
                    <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(circle at 30% 20%, rgba(34,211,238,0.16), transparent 45%), radial-gradient(circle at 80% 0%, rgba(16,185,129,0.12), transparent 40%)" }} />
                    <div className="relative flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800/80 text-2xl shadow-inner shadow-slate-900/60">
                        {getCategoryIcon(category)}
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-semibold text-slate-50">{category}</p>
                        <p className="text-xs text-slate-400">Curated metrics and defaults for this category.</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {loading && (
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="inline-block h-3 w-3 animate-ping rounded-full bg-cyan-400" />
                  <span>Updating category...</span>
                </div>
              )}

              <p className="text-xs text-slate-500">You can change this later from settings.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get icon for each category
const getCategoryIcon = (category) => {
  const icons = {
    "Computer Shop": "💻",
    "Grocery Store": "🛒",
    "Clothing Store": "👔",
    Pharmacy: "💊",
    Restaurant: "🍽️",
  };
  return icons[category] || "🏪";
};

export default CategorySelection;
