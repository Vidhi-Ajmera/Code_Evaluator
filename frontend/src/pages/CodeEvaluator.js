import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  lazy,
  Suspense,
} from "react";
import axios from "axios";
import {
  Button,
  Typography,
  Switch,
  CircularProgress,
  MenuItem,
  Select,
  Snackbar,
  Alert,
} from "@mui/material";
import { FaCode, FaBrain, FaRedoAlt, FaSun, FaMoon } from "react-icons/fa";
import { oneDark } from "@codemirror/theme-one-dark";
import "../styles/CodeEvaluator.css";
import { Tooltip } from "@mui/material";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { Chart } from "chart.js/auto";

const CodeMirror = lazy(() => import("@uiw/react-codemirror"));

const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const languageOptions = [
  { label: "Python", value: "python" },
  { label: "JavaScript", value: "javascript" },
  { label: "Java", value: "java" },
  { label: "C++", value: "cpp" },
];

const languageExtensions = {
  python: python(),
  javascript: javascript(),
  java: java(),
  cpp: cpp(),
};

// Plagiarism Chart Component
const PlagiarismChart = ({ confidenceScore }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    chartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Plagiarism", "Original"],
        datasets: [
          {
            label: "Plagiarism Percentage",
            data: [confidenceScore, 100 - confidenceScore],
            backgroundColor: ["#ff6b6b", "#4caf50"],
            borderColor: ["#ff6b6b", "#4caf50"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.label || "";
                if (label) {
                  label += ": ";
                }
                if (context.raw !== null) {
                  label += context.raw + "%";
                }
                return label;
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [confidenceScore]);

  return <canvas ref={chartRef} />;
};

const CodeEvaluator = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  );
  const [language, setLanguage] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("warning");
  const reportRef = useRef(null);
  const [courseLevel, setCourseLevel] = useState("freshman");

  const handleAnalyze = useCallback(async () => {
    if (!code.trim()) {
      setAlertMessage("Please enter some code to analyze");
      setAlertSeverity("warning");
      setAlertOpen(true);
      return;
    }

    if (!language) {
      setAlertMessage("Please select a language first!");
      setAlertSeverity("warning");
      setAlertOpen(true);
      return;
    }

    setLoading(true);
    setAnalysisResult(null);

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setAlertMessage("Authentication required. Please log in again.");
        setAlertSeverity("error");
        setAlertOpen(true);
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${API_URL}/submit_code`,
        {
          code,
          language,
          course_level: courseLevel,
          assignment_description: "Code analysis request",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAnalysisResult(response.data.plagiarism_analysis);
      setAlertMessage("Code analyzed successfully!");
      setAlertSeverity("success");
      setAlertOpen(true);
    } catch (error) {
      console.error("Error analyzing code:", error);

      if (error.response?.status === 401) {
        setAlertMessage("Session expired. Please log in again.");
        localStorage.removeItem("authToken");
      } else {
        setAlertMessage(
          `Failed to analyze code: ${
            error.response?.data?.detail || error.message
          }`
        );
      }

      setAlertSeverity("error");
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  }, [code, language, courseLevel]);

  useEffect(() => {
    if (analysisResult && reportRef.current) {
      reportRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [analysisResult]);

  useEffect(() => {
    document.body.className = darkMode ? "dark-theme" : "light-theme";
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const handleReset = () => {
    setCode("");
    setAnalysisResult(null);
  };

  const handleCodeChange = (value) => {
    setCode(value);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Ctrl+Enter or Cmd+Enter
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        handleAnalyze();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleAnalyze]);

  return (
    <div className={`container ${darkMode ? "dark-theme" : "light-theme"}`}>
      <div className="theme-toggle">
        <FaSun className={`theme-icon ${!darkMode ? "rotate" : ""}`} />
        <Switch
          checked={darkMode}
          onChange={() => setDarkMode(!darkMode)}
          color="default"
        />
        <FaMoon className={`theme-icon ${darkMode ? "rotate" : ""}`} />
      </div>

      <Typography variant="h5" className="title">
        <FaCode style={{ marginRight: "8px" }} />
        CodeIQ Evaluator
      </Typography>

      <div className="editor-container">
        <div
          className="language-selector"
          style={{ position: "absolute", top: "8px", left: "8px", zIndex: 10 }}
        >
          <Select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            variant="outlined"
            size="small"
            displayEmpty
            className="language-dropdown"
            style={{
              fontSize: "0.85rem",
              padding: "3px 8px",
              borderRadius: "8px",
              background: darkMode ? "#333" : "white",
              color: darkMode ? "white" : "black",
            }}
          >
            <MenuItem value="" disabled>
              Select Language
            </MenuItem>
            {languageOptions.map((lang) => (
              <MenuItem key={lang.value} value={lang.value}>
                {lang.label}
              </MenuItem>
            ))}
          </Select>
        </div>

        <Suspense fallback={<div>Loading Editor...</div>}>
          <CodeMirror
            value={code}
            extensions={language ? [languageExtensions[language]] : []}
            onChange={handleCodeChange}
            placeholder={
              language
                ? "// Write or paste your code here to be analyzed"
                : "// Select a language first"
            }
            theme={darkMode ? oneDark : "light"}
          />
        </Suspense>
      </div>

      <div className="button-container">
        <Button className="reset-button" onClick={handleReset}>
          <FaRedoAlt className="reset-icon" />
          <span>Reset</span>
        </Button>

        <Tooltip
          title="Shortcut: Cmd + Enter (Mac) / Ctrl + Enter (Windows)"
          arrow
        >
          <span>
            <Button
              className="analyze-button"
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={20} style={{ color: "white" }} />
              ) : (
                <>
                  <FaBrain className="reset-icon" />
                  <span>Analyze Code</span>
                </>
              )}
            </Button>
          </span>
        </Tooltip>
      </div>

      {analysisResult && (
        <div className="analysis-container" ref={reportRef}>
          <Typography variant="h6">Analysis Report</Typography>
          <div className="analysis-grid">
            {/* Left Side: Analysis Summary */}
            <div className="analysis-summary">
              <div
                className={`plagiarism-indicator ${
                  analysisResult.plagiarism_detected ? "red" : "green"
                }`}
              >
                <h3>
                  {analysisResult.plagiarism_detected
                    ? "Plagiarism Detected"
                    : "No Plagiarism Detected"}
                </h3>
                <div className="confidence-meter">
                  <div
                    className="confidence-fill"
                    style={{
                      width: `${analysisResult.confidence_score}%`,
                      backgroundColor: analysisResult.plagiarism_detected
                        ? "#ff6b6b"
                        : "#4caf50",
                    }}
                  ></div>
                </div>
                <p className="confidence-text">
                  Confidence: {analysisResult.confidence_score}%
                </p>
              </div>
              <div className="likely-source">
                <h4>Likely Source</h4>
                <p>{analysisResult.likely_source}</p>
              </div>
            </div>

            {/* Right Side: Chart */}
            <div className="chart-section">
              <h4>Plagiarism Percentage</h4>
              <div className="chart-container">
                <PlagiarismChart confidenceScore={analysisResult.confidence_score} />
              </div>
            </div>
          </div>

          {/* Detailed Analysis Section */}
          <div className="description-report">
            <h4>Detailed Analysis</h4>
            <p>{analysisResult.explanation}</p>
          </div>

          {/* Suspicious Elements Section */}
          {analysisResult.suspicious_elements &&
            analysisResult.suspicious_elements.length > 0 && (
              <div className="suspicious-elements">
                <h4>Suspicious Elements</h4>
                {analysisResult.suspicious_elements.map((element, idx) => (
                  <div key={idx} className="suspicious-element">
                    <h5>Section {idx + 1}</h5>
                    <pre>{element.code_section}</pre>
                    <p>
                      <strong>Likely Source:</strong> {element.likely_source}
                    </p>
                    <p>
                      <strong>Confidence:</strong> {element.confidence}%
                    </p>
                    <p>
                      <strong>Explanation:</strong> {element.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}

          {/* Red Flags Section */}
          {analysisResult.red_flags &&
            analysisResult.red_flags.length > 0 && (
              <div className="red-flags">
                <h4>Red Flags</h4>
                <ul>
                  {analysisResult.red_flags.map((flag, idx) => (
                    <li key={idx}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}

          {/* Verification Questions Section */}
          {analysisResult.verification_questions &&
            analysisResult.verification_questions.length > 0 && (
              <div className="verification-questions">
                <h4>Verification Questions</h4>
                <ol>
                  {analysisResult.verification_questions.map((question, idx) => (
                    <li key={idx}>{question}</li>
                  ))}
                </ol>
              </div>
            )}

          {/* Recommendations Section */}
          {analysisResult.recommendations &&
            analysisResult.recommendations.length > 0 && (
              <div className="recommendations">
                <h4>Recommendations</h4>
                <ul>
                  {analysisResult.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      )}

      <Snackbar
        open={alertOpen}
        autoHideDuration={5000}
        onClose={() => setAlertOpen(false)}
      >
        <Alert
          onClose={() => setAlertOpen(false)}
          severity={alertSeverity}
          sx={{ width: "100%" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CodeEvaluator;