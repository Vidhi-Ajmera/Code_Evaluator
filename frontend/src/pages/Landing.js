import React, { useState, useEffect } from "react";
import "../styles/Landing.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { faCode } from "@fortawesome/free-solid-svg-icons";
import TestPlatformVideo from "../../src/Test_PlatForm.mp4";

const LandingPage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleNavigation = (path) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 1000);
      setTimeout(
        () => navigate("/login", { state: { redirectTo: path } }),
        1200
      );
    }
  };

  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="lgo-nav">
        <div className="nav-image" id="main">
          <FontAwesomeIcon icon={faCode} className="text-4xl" />
          <span className="heading-text text-4xl font-bold">
            Code IQ Evaluator
          </span>
        </div>

        <div className="links">
          <a href="#features">Features</a>
          <a href="#how-to-use">Steps to Use</a>
          <a href="#about">About Meridian</a>
          <a href="#contact">Contact Us</a>
        </div>

        <div className="auth-buttons">
          <button className="log-butt" onClick={() => navigate("/login")}>
            Log In
          </button>
          <button className="sign-butt" onClick={() => navigate("/signup")}>
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section" id="main">
        <h1 className="hero-title">
          <span>AI</span>-Based Code Evaluation
        </h1>
        <p className="hero-subtitle">
          Get AI-powered feedback, plagiarism checking, and code validation
          instantly.
        </p>
      </header>

      {/* Platform Selection Boxes */}
      <div className="platform-container">
        <div
          className="platform-box"
          onClick={() => handleNavigation("/test-platform")}
          style={{
            cursor: "pointer",
            opacity: isAuthenticated ? 1 : 0.6,
          }}
        >
          <h3>Test Platform</h3>
          <p>
            Solve problem statements, run code against test cases, and validate
            performance.
          </p>
        </div>

        <div
          className="platform-box"
          onClick={() => handleNavigation("/code-evaluator")}
          style={{
            cursor: "pointer",
            opacity: isAuthenticated ? 1 : 0.6,
          }}
        >
          <h3>Learning & Practice</h3>
          <p>Improve coding skills with AI-generated hints and feedback.</p>
        </div>
      </div>

      {/* Video Section */}
      <h2 className="section-title">Key Features</h2>
      <div className="mid-section" id="features">
        <div className="video-container">
          <video autoPlay loop muted playsInline width="100%" height="auto">
            <source src={TestPlatformVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Features Section */}
        <section className="features-section">
          <h2 className="section-title">Why Choose Our AI Evaluator?</h2>
          <p className="features-description">
            Elevate your coding experience with cutting-edge AI-powered
            analysis.
          </p>
          <ul className="features-list">
            <li>
              ⚡ <strong>Instant AI Feedback</strong> – Get real-time insights
              to refine your code.
            </li>
            <li>
              🛡️ <strong>Plagiarism Detection</strong> – Ensure originality with
              AI-driven similarity checks.
            </li>
            <li>
              ✅ <strong>Code Correctness Validation</strong> – Validate logic
              and edge cases with automated testing.
            </li>
            <li>
              🧠 <strong>Intelligent Hints</strong> – Optimize your code with
              AI-generated suggestions.
            </li>
          </ul>
        </section>
      </div>

      {/* How It Works Section */}
      <section className="steps-section" id="how-to-use">
        <h2 className="section-title">How It Works</h2>
        <div className="how-it-works-container">
          {/* Left Panel - Test Platform */}
          <div className="how-it-works-panel test-platform">
            <h3>Test Platform</h3>
            <ol className="steps-list">
              <li>
                <span>
                  1️⃣ <strong>Select a Coding Language</strong>
                </span>
                <p>
                  Pick a coding language & submit code for evaluation with
                  real-world problem statements.
                </p>
              </li>
              <li>
                <span>
                  2️⃣ <strong>Run Automated Tests</strong>
                </span>
                <p>
                  Execute test cases, including edge cases, for code validation.
                </p>
              </li>
              <li>
                <span>
                  3️⃣ <strong>Check Performance</strong>
                </span>
                <p>Get insights into runtime efficiency and memory usage.</p>
              </li>
              <li>
                <span>
                  4️⃣ <strong>Receive AI Feedback</strong>
                </span>
                <p>
                  Improve your code with AI-generated suggestions and best
                  practices.
                </p>
              </li>
            </ol>
          </div>

          {/* Right Panel - Learning & Practice */}
          <div className="how-it-works-panel practice-platform">
            <h3>Learning & Practice</h3>
            <ol className="steps-list">
              <li>
                <span>
                  1️⃣ <strong>Select a Coding Language</strong>
                </span>
                <p>Pick a coding language to practice.</p>
              </li>
              <li>
                <span>
                  2️⃣ <strong>Write & Paste Code</strong>
                </span>
                <p>Experiment with different coding approaches.</p>
              </li>
              <li>
                <span>
                  3️⃣ <strong>AI-Powered Hints</strong>
                </span>
                <p>
                  Receive intelligent hints and suggestions for improvement.
                </p>
              </li>
              <li>
                <span>
                  4️⃣ <strong>Track Progress</strong>
                </span>
                <p>
                  Monitor your improvement over time and master new concepts.
                </p>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* About Meridian Section */}
      <section className="about-section" id="about">
        <h2 className="section-title">About Meridian</h2>
        <p className="about-text">
          Meridian is dedicated to advancing AI-powered solutions for
          developers.
        </p>
      </section>

      {/* Contact Us Section */}
      <section className="contact-section" id="contact">
        <h2 className="section-title">Contact Us</h2>
        <p className="contact-text">
          Have questions? Reach us at{" "}
          <a href="mailto:support@meridian.com">support@meridian.com</a>
        </p>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p className="footer-text">
          &copy; 2025 Meridian. All rights reserved.
        </p>
      </footer>

      {/* UPDATED: Show login popup if user is not authenticated */}
      {showPopup && (
        <div className="mini-popup">
          <p>🔒 Please log in to use platform</p>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
