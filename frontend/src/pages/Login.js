import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Added for navigation
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import axios from "axios"; // Added for API requests
import { auth, provider, signInWithPopup } from "../components/firebase";
import "../../src/styles/Login.css";
import { FaCode } from "react-icons/fa";

const LoginPage = () => {
  const navigate = useNavigate(); // Navigation hook
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8000/login", {
        email,
        password,
      });

      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token); // Save token
        alert("Login successful!");
        navigate("/code-evaluator"); // Navigate to CodeEvaluator page
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Invalid email or password. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("User logged in:", user);
      localStorage.setItem("user", JSON.stringify(user)); // Save Google user data
      alert(`Welcome ${user.displayName}!`);
      navigate("/code-evaluator"); // Navigate to CodeEvaluator page
    } catch (error) {
      console.error("Error during Google login:", error);

      if (error.code === "auth/user-not-found") {
        alert("User not registered. Please sign up first.");
      } else if (error.code === "auth/popup-closed-by-user") {
        alert("Login popup was closed before completing.");
      } else if (error.code === "auth/network-request-failed") {
        alert("Network error. Please check your internet connection.");
      } else {
        alert("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="left-panel">
        <DotLottieReact
          src="https://lottie.host/4fd012a4-6979-41bc-8db2-86bedac4787f/GBEcGXnHEX.lottie"
          loop
          autoplay
        />
      </div>
      <div className="right-panel">
        <h1 className="brand-title">
          <FaCode style={{ marginRight: "5px", marginTop: "10px" }} />
          <span style={{ color: "black" }}>CodeIQ.ai</span>
        </h1>
        <div className="login-box">
          <h2>Welcome Back!</h2>
          <p
            style={{
              marginBottom: "25px",
              color: "black",
              fontSize: "1.1rem",
            }}
          >
            Log in to your account to continue.
          </p>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "🔒"}
                </button>
              </div>
            </div>
            <button type="submit" className="login-btn">
              Login Now
            </button>
            <div className="or-separator">
              <span>OR</span>
            </div>

            <div className="login-buttons">
              <button
                type="button"
                className="google-login-btn"
                onClick={handleGoogleLogin}
              >
                <img
                  src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA"
                  alt="Google Logo"
                  className="google-logo"
                />
                Login with Google
              </button>
            </div>
            <p className="register-text">
              Don't have an account? <a href="../Signup">Click Here</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
