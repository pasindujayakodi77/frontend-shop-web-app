import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Use environment variable for API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/auth/login`, formData);
      localStorage.setItem("token", response.data.token);
      
      // Store userId for user-specific data
      if (response.data.user?.id || response.data.userId) {
        const userId = response.data.user?.id || response.data.userId;
        localStorage.setItem("userId", userId);
      }
      
      alert(response.data.message);
      
      // Check if user has selected a category
      const hasCategory = response.data.user?.category || response.data.category;
      
      if (hasCategory) {
        navigate("/dashboard");
      } else {
        navigate("/select-category");
      }
    } catch (err) {
      alert("Login Failed: " + err.response.data.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col max-w-md mx-auto p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <input type="email" placeholder="Email" className="mb-2 p-2 border rounded" onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
      <input type="password" placeholder="Password" className="mb-2 p-2 border rounded" onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">Login</button>
    </form>
  );
};

export default Login;