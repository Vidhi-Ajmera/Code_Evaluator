import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import axios from "axios";
import { auth, provider, signInWithPopup } from "../components/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import "../../src/styles/Login.css";
import { FaCode } from "react-icons/fa";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/login`,
        {
          email,
          password,
        }
      );

      console.log("Login Response:", response); // ✅ Check server response

      if (response.data.access_token) {
        console.log(
          "Token Generated (Email/Password):",
          response.data.access_token
        ); // ✅ Token Debug
        localStorage.setItem("authToken", response.data.access_token);
        localStorage.setItem("userInfo", JSON.stringify({ email }));
        alert("Login successful!");
        navigate("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Invalid email or password. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    try {

      await setPersistence(auth, browserLocalPersistence);
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("User logged in:", user);
      localStorage.setItem("authToken", user.access_token); // FIXED: Correct Token Key
      localStorage.setItem("userInfo", JSON.stringify({ email: user.email })); // Save Google User Info
      alert(`Welcome ${user.displayName}!`);
      navigate("/");
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

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Please check your inbox.");
    } catch (error) {
      console.error("Error sending password reset email:", error);
      if (error.code === "auth/user-not-found") {
        alert("No user found with this email.");
      } else if (error.code === "auth/invalid-email") {
        alert("Invalid email address.");
      } else {
        alert("Failed to send password reset email. Please try again.");
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

            <p className="forgot-password-text">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="forgot-password-btn"
              >
                Forgot Password?
              </button>
            </p>

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
