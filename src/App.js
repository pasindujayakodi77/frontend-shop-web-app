import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import CategorySelection from "./components/CategorySelection";
import Inventory from "./components/Inventory";
import Sales from "./components/Sales";
import Reports from "./components/Reports";
import Expenses from "./components/Expenses";
import ProtectedRoute from "./components/ProtectedRoute";
import OAuthHandler from "./components/OAuthHandler";
import SocialEmail from "./components/SocialEmail";
import LandingPage from "./components/LandingPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/oauth/callback" element={<OAuthHandler />} />
        <Route path="/social-email" element={<SocialEmail />} />
        <Route 
          path="/select-category" 
          element={
            <ProtectedRoute>
              <CategorySelection />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/inventory" 
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sales" 
          element={
            <ProtectedRoute>
              <Sales />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/expenses" 
          element={
            <ProtectedRoute>
              <Expenses />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;