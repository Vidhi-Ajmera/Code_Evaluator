// src/pages/PasswordResetPage.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { handlePasswordReset, getActionCode, isPasswordResetPage } from "../components/firebase";
import "../styles/PasswordReset.css";
import { FaCode } from "react-icons/fa";

const PasswordResetPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [actionCode, setActionCode] = useState(null);

  useEffect(() => {
    // Check if this is a valid password reset page
    if (isPasswordResetPage()) {
      setActionCode(getActionCode());
    } else {
      // Redirect to login if not a valid reset page
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form inputs
    if (!password || !confirmPassword) {
      setStatus({
        type: "error",
        message: "Please fill in all fields"
      });
      return;
    }
    
    if (password !== confirmPassword) {
      setStatus({
        type: "error",
        message: "Passwords do not match"
      });
      return;
    }
    
    if (password.length < 6) {
      setStatus({
        type: "error",
        message: "Password should be at least 6 characters"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await handlePasswordReset(actionCode, password);
      
      if (result.success) {
        setStatus({
          type: "success",
          message: "Password reset successful! Redirecting to login..."
        });
        
        // Wait a bit before redirecting
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setStatus({
          type: "error",
          message: result.message
        });
      }
    } catch (error) {
      console.error("Reset error:", error);
      setStatus({
        type: "error",
        message: "Failed to reset password. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="password-reset-container">
      <div className="reset-panel">
        <h1 className="brand-title">
          <FaCode style={{ marginRight: "5px" }} />
          <span>CodeIQ.ai</span>
        </h1>
        
        <div className="reset-box">
          <h2>Reset Your Password</h2>
          <p className="reset-instruction">
            Please enter your new password below.
          </p>
          
          <form onSubmit={handleSubmit} className="reset-form">
            <div className="input-group">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            {status.message && (
              <div className={`status-message ${status.type}`}>
                {status.message}
              </div>
            )}
            
            <button 
              type="submit" 
              className="reset-submit-btn" 
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Reset Password"}
            </button>
            
            <p className="back-to-login">
              <a href="/login">Back to Login</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;