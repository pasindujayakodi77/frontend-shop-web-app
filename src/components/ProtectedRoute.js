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
    
    if (token) {
      // User is authenticated with a real token
      setIsAuthenticated(true);
    } else {
      // No token - enable guest mode for exploration
      localStorage.setItem("guest_mode", "true");
      setIsAuthenticated(true); // Allow access as guest
    }
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
