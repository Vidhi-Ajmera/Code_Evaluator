import React, { useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { auth, provider, signInWithPopup } from "../components/firebase";
import "../../src/styles/Login.css";
import { FaCode } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Debug: Log the backend URL
      const backendUrl =
        process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
      console.log("Backend URL:", backendUrl);

      // Send login request to the backend
      const response = await axios.post(`${backendUrl}/login`, {
        email,
        password,
      });

      const { access_token, username } = response.data;
      localStorage.setItem("authToken", access_token); // Store the token
      localStorage.setItem("username", username); // Store the username
      alert("Login successful!");
      navigate("/code-evaluator"); // Redirect to the code evaluator page
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please check your credentials.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("User logged in:", user);
      alert(`Welcome ${user.displayName}!`);
      localStorage.setItem("authToken", user.accessToken); // Store the token
      localStorage.setItem("username", user.displayName); // Store the username
      navigate("/code-evaluator"); // Redirect to the code evaluator page
    } catch (error) {
      console.error("Error during login:", error);
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
          Code IQ Evaluator
        </h1>
        <div className="login-box">
          <h2>Welcome Back!</h2>
          <p style={{ marginBottom: "25px" }}>
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
              <button
                type="button"
                className="micro-login-btn"
                onClick={handleGoogleLogin}
              >
                <img
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAclBMVEXz8/PzUyWBvAYFpvD/ugjz9fb19Pbz+fr49fv79vPy9fsAofD/tgDz29Xh6tLzRAB5uADzTRjzlH2u0XBwxPH70HHS5vP16tLz4+Dn7d3zPQCpz2bd6/NmwfH7zmf07d3zjnTzuKrI3qGh1fL43aIAnPDEciU8AAABeUlEQVR4nO3cSW7CUBBFURLiD4GYvjVtGva/xUxixxJfyqhMBudu4Omo5tXrSZKkVkV4zVQKLysso9vVxLSfRJe7YFlNY6uug5+t4WEW3eT+ikU5fYptvmiEy+fgCAkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCbsVVvPYpi3h7BHC3XUR3HstTB/L4A77zJ/dYhBes5WG0eUfCUuS9Gev4TVTaRRdkQEeT6vYTp81MX2tgztfMsTNrR/b+FQLR+u36LY54ThY2F+1hC+xERISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEnYrvI1ju/3+Lz0/5H9psYnu2ExdttHd+7qtCO/RQkmS/lffeJs9EU0/9ZkAAAAASUVORK5CYII="
                  alt="Google Logo"
                  className="google-logo"
                />
                Login with Microsoft
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
