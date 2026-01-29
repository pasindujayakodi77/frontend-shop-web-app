import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated as checkAuthToken, isGuestMode } from "../utils/auth";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [location.state]);

  const checkAuth = () => {
    const token = checkAuthToken();
    let guest = isGuestMode();

    // If user came via guest CTA, set flag and allow
    if (!token && !guest && location.state?.guest) {
      localStorage.setItem("guest_mode", "true");
      guest = true;
    }

    // Fallback: allow guest mode for unauthenticated visitors so they can explore
    if (!token && !guest) {
      localStorage.setItem("guest_mode", "true");
      guest = true;
    }

    setIsAuthenticated(token || guest);
  };

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render children if authenticated
  return children;
};

export default ProtectedRoute;
