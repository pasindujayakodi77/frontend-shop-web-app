import React, { useState } from "react";
import axios from "axios";

// Use environment variable for API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Signup = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", shopCategory: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, formData);
      alert("Sign-Up Successful: " + response.data.message);
    } catch (err) {
      alert("Sign-Up Failed: " + err.response.data.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col max-w-md mx-auto p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Sign Up</h2>
      <input type="text" placeholder="Name" className="mb-2 p-2 border rounded" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
      <input type="email" placeholder="Email" className="mb-2 p-2 border rounded" onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
      <input type="password" placeholder="Password" className="mb-2 p-2 border rounded" onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
      <input type="text" placeholder="Shop Category" className="mb-2 p-2 border rounded" onChange={(e) => setFormData({ ...formData, shopCategory: e.target.value })} />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">Sign Up</button>
    </form>
  );
};

export default Signup;