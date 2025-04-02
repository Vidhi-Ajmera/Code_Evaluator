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
import Contest from "./pages/Contest";
import Customized from "./pages/Customized";
import DifficultySelection from "./pages/Difficulty";

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
        <Route path="/contest" element={<Contest />} />
        <Route path="/customized" element={<Customized />} />
        <Route path="/difficulty" element={<DifficultySelection />} />
      </Routes>
    </Router>
  );
}

export default App;
