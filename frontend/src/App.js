import React from "react";
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
import TestEvaluator from "./pages/TestEvaluator";

function App() {
  const isAuthenticated = () => {
    const token = localStorage.getItem("authToken");
    console.log("Token:", token);
    return token && token !== "null" && token !== "undefined"; // Strict validation
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/code-evaluator" element={<CodeEvaluator />} />
        <Route path="/test-platform" element={<TestEvaluator />} />
      </Routes>
    </Router>
  );
}

export default App;
