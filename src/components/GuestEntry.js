import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Sets guest flag and redirects into the app so users can explore without signup.
const GuestEntry = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("guest_mode", "true");
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  return null;
};

export default GuestEntry;