import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CodeEvaluator from "./pages/CodeEvaluator";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for auth token
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      setIsAuthenticated(!!token);
      setLoading(false);
    };

    checkAuth();

    // Listen for changes to localStorage
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  // Custom authentication guard component
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return <div>Loading...</div>; // Or a nicer loading spinner
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={
            <Login
              setIsAuthenticated={(value) => {
                setIsAuthenticated(value);
                // Trigger storage event for other tabs
                if (value) {
                  window.dispatchEvent(new Event("storage"));
                }
              }}
            />
          }
        />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/code-evaluator"
          element={
            <ProtectedRoute>
              <CodeEvaluator />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
