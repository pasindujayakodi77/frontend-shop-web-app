import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

// Use environment variable for API URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const Signup = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", shopCategory: "" });
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setStatus({ loading: false, error: "", success: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "", success: "" });

    try {
      const response = await axios.post(`${API_URL}/auth/signup`, formData);
      setStatus({ loading: false, error: "", success: response.data.message || "Account created!" });
      navigate("/login");
    } catch (err) {
      const message = err?.response?.data?.error || "Unable to sign up. Please try again.";
      setStatus({ loading: false, error: message, success: "" });
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
        <div className="w-full max-w-md space-y-6">
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
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Create Account</p>
              <h1 className="text-3xl font-semibold text-slate-50">ShopFlow</h1>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur-xl shadow-[0_24px_120px_-40px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
            <div className="px-8 py-10 space-y-8">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-slate-50">Create your ShopFlow account</h2>
                <p className="text-sm text-slate-400">Sign up to start managing products, sales, and expenses.</p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {status.error && (
                  <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                    {status.error}
                  </div>
                )}
                {status.success && (
                  <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                    {status.success}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm text-slate-300" htmlFor="name">
                    Full name
                  </label>
                  <div className="group relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 transition group-focus-within:text-cyan-300">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M6 19.5a6 6 0 1 1 12 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    </span>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Alex Johnson"
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/70 px-10 py-3 text-slate-100 placeholder:text-slate-500 transition focus:border-cyan-400/80 focus:bg-slate-900/70 focus:ring-2 focus:ring-cyan-500/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-300" htmlFor="email">
                    Email
                  </label>
                  <div className="group relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 transition group-focus-within:text-cyan-300">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                        <path
                          d="M4 6h16v12H4z"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinejoin="round"
                        />
                        <path d="m4 7 8 5 8-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    </span>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="you@shopflow.com"
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/70 px-10 py-3 text-slate-100 placeholder:text-slate-500 transition focus:border-cyan-400/80 focus:bg-slate-900/70 focus:ring-2 focus:ring-cyan-500/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-300" htmlFor="password">
                    Password
                  </label>
                  <div className="group relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 transition group-focus-within:text-cyan-300">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                        <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M9 10V7a3 3 0 0 1 6 0v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    </span>
                    <input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      placeholder="Create a strong password"
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/70 px-10 py-3 text-slate-100 placeholder:text-slate-500 transition focus:border-cyan-400/80 focus:bg-slate-900/70 focus:ring-2 focus:ring-cyan-500/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-300" htmlFor="shopCategory">
                    Shop category
                  </label>
                  <div className="group relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 transition group-focus-within:text-cyan-300">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                        <path d="M4 10h16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        <path d="M6 6h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M9 14h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    </span>
                    <input
                      id="shopCategory"
                      type="text"
                      required
                      value={formData.shopCategory}
                      onChange={(e) => handleChange("shopCategory", e.target.value)}
                      placeholder="E.g. Electronics, Apparel"
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/70 px-10 py-3 text-slate-100 placeholder:text-slate-500 transition focus:border-cyan-400/80 focus:bg-slate-900/70 focus:ring-2 focus:ring-cyan-500/30"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status.loading}
                  className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 px-4 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-cyan-500/25 transition hover:-translate-y-[1px] hover:shadow-cyan-400/40 focus-visible:ring-2 focus-visible:ring-cyan-200 disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {status.loading ? "Creating account..." : "Create account"}
                </button>

                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>Already have an account?</span>
                  <Link to="/login" className="font-medium text-cyan-300 transition hover:text-cyan-200">
                    Log in
                  </Link>
                </div>

                <p className="text-xs text-slate-500">
                  By continuing, you agree to our Terms and confirm you have read our Privacy Policy.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;