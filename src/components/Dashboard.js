import React from "react";

const Dashboard = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Logged out successfully.");
    window.location.href = "/login";
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Welcome to the Dashboard</h2>
      <p>This is a protected route. Only logged-in users can access it.</p>
      <button onClick={handleLogout} className="bg-red-500 text-white p-2 rounded mt-4">
        Logout
      </button>
    </div>
  );
};

export default Dashboard;