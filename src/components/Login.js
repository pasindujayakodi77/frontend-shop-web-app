import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

// Use environment variable for API URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ loading: false, error: "" });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Surface OAuth errors returned via query params
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setStatus({ loading: false, error: errorParam });
    }

    // Clean up the Facebook #_=_ fragment so back/refresh is tidy
    if (window.location.hash === "#_=_" && window.history.replaceState) {
      const cleanUrl = window.location.href.replace(/#_=_$/, "");
      window.history.replaceState(null, "", cleanUrl);
    }
  }, [searchParams]);

  const handleSocialLogin = (provider) => {
    // Redirect user to backend OAuth endpoint
    window.location.href = `${API_URL}/auth/${provider}`;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setStatus((prev) => ({ ...prev, error: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "" });

    try {
      const response = await axios.post(`${API_URL}/auth/login`, formData);
      localStorage.setItem("token", response.data.token);

      // Store userId for user-specific data
      if (response.data.user?.id || response.data.userId) {
        const userId = response.data.user?.id || response.data.userId;
        localStorage.setItem("userId", userId);
      }

      // Check if user has selected a category
      const hasCategory = response.data.user?.category || response.data.category;

      if (hasCategory) {
        navigate("/dashboard");
      } else {
        navigate("/select-category");
      }
    } catch (err) {
      const message = err?.response?.data?.error || "Unable to log in. Please try again.";
      setStatus({ loading: false, error: message });
      return;
    }

    setStatus({ loading: false, error: "" });
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
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Secure Access</p>
              <h1 className="text-3xl font-semibold text-slate-50">ShopFlow</h1>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur-xl shadow-[0_24px_120px_-40px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
            <div className="px-8 py-10 space-y-8">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-slate-50">Welcome back</h2>
                <p className="text-sm text-slate-400">Log in to manage sales, inventory, and insights.</p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {status.error && (
                  <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                    {status.error}
                  </div>
                )}

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
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      placeholder="Your secure password"
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/70 px-10 py-3 text-slate-100 placeholder:text-slate-500 transition focus:border-cyan-400/80 focus:bg-slate-900/70 focus:ring-2 focus:ring-cyan-500/30"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status.loading}
                  className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 px-4 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-cyan-500/25 transition hover:-translate-y-[1px] hover:shadow-cyan-400/40 focus-visible:ring-2 focus-visible:ring-cyan-200 disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {status.loading ? "Logging in..." : "Log In"}
                </button>

                <div className="flex items-center justify-between text-sm text-slate-400">
                  <button
                    type="button"
                    className="transition hover:text-cyan-300"
                    onClick={() => navigate("/forgot-password")}
                  >
                    Forgot password?
                  </button>
                  <Link to="/signup" className="font-medium text-cyan-300 transition hover:text-cyan-200">
                    Create an account
                  </Link>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span className="h-px flex-1 bg-slate-700/80" />
                  <span>or continue with</span>
                  <span className="h-px flex-1 bg-slate-700/80" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/40 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/60 hover:bg-slate-900/70 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-500/40"
                    onClick={() => handleSocialLogin("google")}
                  >
                    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M21.35 11.1H12.3v2.9h5.1c-.2 1.3-.84 2.4-1.86 3.13v2.6h3c1.76-1.63 2.81-4.03 2.81-6.88 0-.68-.07-1.34-.2-1.95Z"
                        fill="#4285F4"
                      />
                      <path d="M12.3 22c2.52 0 4.63-.83 6.17-2.27l-3-2.6c-.83.56-1.9.9-3.17.9-2.44 0-4.52-1.64-5.26-3.85H4.01v2.72A9.7 9.7 0 0 0 12.3 22Z" fill="#34A853" />
                      <path d="M7.04 14.18a5.82 5.82 0 0 1 0-3.72V7.74H4.02a9.7 9.7 0 0 0 0 8.52l3.02-2.08Z" fill="#FBBC05" />
                      <path d="M12.3 6.34c1.37 0 2.61.47 3.59 1.39l2.7-2.7A9.68 9.68 0 0 0 4.02 7.74l3.02 2.72c.74-2.2 2.82-3.85 5.26-3.85Z" fill="#EA4335" />
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/40 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/60 hover:bg-slate-900/70 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-500/40"
                    onClick={() => handleSocialLogin("facebook")}
                  >
                    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22 12.07C22 6.48 17.52 2 11.93 2 6.35 2 2 6.48 2 12.07 2 17.1 5.66 21.2 10.44 22v-7.03H7.9v-2.9h2.54v-2.2c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.25 0-1.65.78-1.65 1.57v1.84h2.8l-.45 2.9h-2.35V22C18.34 21.2 22 17.1 22 12.07Z" />
                    </svg>
                    Facebook
                  </button>
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

export default Login;