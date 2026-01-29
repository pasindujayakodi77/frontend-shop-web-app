import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace(/\/+$/, '') + '/api'
  : '/api';

const SocialEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ loading: false, error: "" });

  const pendingToken = searchParams.get("token") || searchParams.get("pendingToken");
  const provider = searchParams.get("provider") || "facebook";
  const displayName = searchParams.get("name") || "your account";

  useEffect(() => {
    if (!pendingToken) {
      navigate("/login", { replace: true });
    }
  }, [pendingToken, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pendingToken) return;

    setStatus({ loading: true, error: "" });

    try {
      const response = await axios.post(`${API_URL}/auth/social/complete-email`, {
        token: pendingToken,
        email,
      });

      const { token, user } = response.data || {};
      if (token) {
        localStorage.setItem("token", token);
      }
      if (user?.id) {
        localStorage.setItem("userId", user.id);
      }

      const hasCategory = user?.shopCategory;
      navigate(hasCategory ? "/dashboard" : "/select-category", { replace: true });
    } catch (err) {
      const message = err?.response?.data?.error || "Unable to complete sign-in. Please try again.";
      setStatus({ loading: false, error: message });
      return;
    }

    setStatus({ loading: false, error: "" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 select-none">
        <div className="absolute -top-40 -left-32 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="absolute -bottom-48 -right-24 h-80 w-80 rounded-full bg-emerald-500/16 blur-[110px]" />
        <div className="absolute top-1/3 right-1/4 h-40 w-40 rotate-12 rounded-full bg-gradient-to-br from-blue-600/25 via-cyan-500/25 to-emerald-400/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Almost there</p>
            <h1 className="text-3xl font-semibold text-slate-50">Add your email</h1>
            <p className="text-sm text-slate-400">
              {`We couldn't get an email from ${provider}. Enter the email to finish signing in for ${displayName}.`}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-xl shadow-[0_24px_120px_-40px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
            <form className="space-y-5 px-8 py-10" onSubmit={handleSubmit}>
              {status.error && (
                <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                  {status.error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm text-slate-300" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-800/70 px-4 py-3 text-slate-100 placeholder:text-slate-500 transition focus:border-cyan-400/80 focus:bg-slate-900/70 focus:ring-2 focus:ring-cyan-500/30"
                />
              </div>

              <button
                type="submit"
                disabled={status.loading}
                className="btn-primary w-full justify-center text-base"
              >
                {status.loading ? "Saving..." : "Continue"}
              </button>

              <p className="text-xs text-slate-500 text-center">
                We'll create your account with this email for {provider} sign-in.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialEmail;
