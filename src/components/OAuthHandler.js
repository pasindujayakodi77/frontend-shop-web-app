import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// Handles OAuth redirect from backend; stores token/userId then routes appropriately
const OAuthHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const userId = searchParams.get("userId");
    const shopCategory = searchParams.get("shopCategory");
    const categorySelected = searchParams.get("categorySelected");
    const error = searchParams.get("error");
    const pendingToken = searchParams.get("pendingToken");
    const provider = searchParams.get("provider");
    const name = searchParams.get("name");

    if (error) {
      navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
      return;
    }

    // If provider didn't return an email, send user to email capture flow
    if (pendingToken) {
      const params = new URLSearchParams();
      params.set("token", pendingToken);
      if (provider) params.set("provider", provider);
      if (name) params.set("name", name);

      navigate(`/social-email?${params.toString()}`, { replace: true });
      return;
    }

    if (token) {
      localStorage.setItem("token", token);
    }
    if (userId) {
      localStorage.setItem("userId", userId);
    }

    // Normalize params and decide where to send the user
    const hasValidCategory = !!shopCategory && shopCategory !== "null" && shopCategory !== "undefined";
    const hasCompletedCategory = categorySelected === "true";

    if (hasValidCategory && hasCompletedCategory) {
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/select-category", { replace: true });
    }
  }, [navigate, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <div className="rounded-xl border border-slate-800 bg-slate-900 px-6 py-4 shadow-lg">
        Finishing sign-in...
      </div>
    </div>
  );
};

export default OAuthHandler;
