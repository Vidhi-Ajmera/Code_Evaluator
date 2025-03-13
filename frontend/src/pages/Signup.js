import React, { useState, useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Signup.css";
import { FaCode } from "react-icons/fa";
import PasswordStrengthChecker from "../components/PasswordStrengthChecker";

const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      // User is already logged in, redirect to landing page
      navigate("/");
    }
  }, [navigate]);

  
  // Password rules checking for enabling/disabling submit button
  const isPasswordValid =
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[@$!%*?&#]/.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate form
    if (!email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setIsLoading(true);

    try {
      // Create username from email (everything before @)
      const username = email.split('@')[0];
      
      // Store authentication data
      localStorage.setItem("authToken", "user-auth-token-" + Date.now());
      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          email: email,
          username: username,
          signupDate: new Date().toISOString(),
        })
      );

      // Small delay to make the loading state visible
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Explicitly redirect to landing page
      console.log("Redirecting to landing page");
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Signup error:", err);
      setError("An error occurred during signup. Please try again.");
    } finally {
      setIsLoading(false);
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
        <h1 className="brand-title" onClick={() => navigate("/")}>
          <FaCode style={{ marginRight: "5px", marginTop: "10px" }} />
          CodeIQ.ai
        </h1>
        <div className="signup-box">
          <h2>Create an Account</h2>
          <p style={{ marginBottom: "25px", color: "black" }}>
            Sign up to start using our platform!
          </p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="signup-form">
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="password-wrapper">
                <input
                  id="password"
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
                   {/* Show rules if password doesn't match all */}
                    <PasswordStrengthChecker password={password} />
            </div>
            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-wrapper">
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
           <button
                  type="submit"
                  className={`signup-btn ${
                  !isPasswordValid || password !== confirmPassword ? "disabled-btn" : ""
                  }`}
                  disabled={!isPasswordValid || password !== confirmPassword || isLoading}
                  onClick={handleSubmit}
                  >
                  {isLoading ? "Signing Up..." : "Sign Up Now"}
            </button>

            <p className="login-text">
              Already have an account? <Link to="/login">Log In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
