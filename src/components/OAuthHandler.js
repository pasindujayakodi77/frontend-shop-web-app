import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace(/\/+$/, '') + '/api'
  : '/api';

// Handles OAuth redirect from backend; stores token/userId then routes appropriately
const OAuthHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuth = async () => {
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

      const hasValidCategoryParam = !!shopCategory && shopCategory !== "null" && shopCategory !== "undefined";
      const hasCompletedCategoryParam = categorySelected === "true";

      // Prefer authoritative profile check to avoid skipping category selection incorrectly
      let categoryFromProfile = null;
      let categoryCompleted = false;
      if (token) {
        try {
          const profileRes = await fetch(`${API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          if (profileRes.ok) {
            const profile = await profileRes.json();
            const userProfile = profile?.user || profile;
            categoryFromProfile = userProfile?.shopCategory || userProfile?.category || null;
            categoryCompleted = !!userProfile?.isCategorySelected;

            // Backfill userId if the query param was missing
            if (!userId && userProfile?._id) {
              localStorage.setItem("userId", userProfile._id);
            }
          }
        } catch (profileErr) {
          console.warn("Profile lookup failed; falling back to query params", profileErr);
        }
      }

      const resolvedCategory = categoryFromProfile || shopCategory;
      const hasCategory = !!resolvedCategory && resolvedCategory !== "null" && resolvedCategory !== "undefined";
      const hasCompletedCategory = hasCompletedCategoryParam || categoryCompleted || !!categoryFromProfile;

      if (hasCategory && hasCompletedCategory) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/select-category", { replace: true });
      }
    };

    handleOAuth();
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
