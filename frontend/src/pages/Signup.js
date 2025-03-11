import React, { useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import "../styles/Signup.css";
import { FaCode } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      // Send signup request to the backend
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/signup`,
        {
          email,
          password,
          username: email.split("@")[0], // Use email prefix as username
        }
      );

      // Handle successful signup
      if (response.data.message === "User created successfully") {
        alert("Signup successful! Please log in.");
        navigate("/login"); // Redirect to the login page
      }
    } catch (error) {
      console.error("Signup failed:", error);
      if (error.response && error.response.data.detail) {
        setError(error.response.data.detail); // Display backend error message
      } else {
        setError("Signup failed. Please try again.");
      }
    }
  };

  return (
    <div className="signup-container">
      {/* Left Panel: Lottie Animation */}
      <div className="left-panel">
        <DotLottieReact
          src="https://lottie.host/dc62d82a-bfe7-40da-9a24-f288d2091843/ARq8kqUeNP.lottie"
          loop
          autoplay
        />
      </div>

      {/* Right Panel: Signup Form */}
      <div className="right-panel">
        <h1 className="brand-title">
          <FaCode style={{ marginRight: "5px", marginTop: "10px" }} />
          Code IQ Evaluator
        </h1>
        <div className="signup-box">
          <h2>Create an Account</h2>
          <p style={{ marginBottom: "25px" }}>
            Sign up to start using our platform!
          </p>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit} className="signup-form">
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
            <div className="input-group">
              <label>Confirm Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="signup-btn">
              Sign Up Now
            </button>
            <p className="login-text">
              Already have an account? <a href="../login">Log In</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
