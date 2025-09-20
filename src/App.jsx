import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import axios from "axios";
import Login from "./components/login";
import Register from "./components/register";
import LeadsList from "./components/leadsList";
import LeadForm from "./components/leadForm";
import Navbar from "./components/navbar";
import "./App.css";


axios.defaults.baseURL = "http://localhost:5000"; 
axios.defaults.withCredentials = true;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("/api/auth/me");
        setUser(response.data.user);
      } catch (error) {
        setUser(null); 
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = (userData) => setUser(userData);

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {user && <Navbar user={user} onLogout={handleLogout} />}
        <div className="main-content">
          <Routes>
            <Route
              path="/login"
              element={
                !user ? (
                  <Login onLogin={handleLogin} />
                ) : (
                  <Navigate to="/leads" replace />
                )
              }
            />
            <Route
              path="/register"
              element={
                !user ? (
                  <Register onLogin={handleLogin} />
                ) : (
                  <Navigate to="/leads" replace />
                )
              }
            />
            <Route
              path="/leads"
              element={user ? <LeadsList /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/leads/new"
              element={user ? <LeadForm /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/leads/edit/:id"
              element={user ? <LeadForm /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/"
              element={<Navigate to={user ? "/leads" : "/login"} replace />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
