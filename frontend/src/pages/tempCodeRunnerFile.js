import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  lazy,
  Suspense,
} from "react";
import { useNavigate } from "react-router-dom";

import { jwtDecode } from "jwt-decode";
import axios from "axios";
import {
  Button,
  Typography,
  CircularProgress,
  MenuItem,
  Switch,
  Snackbar,
  Alert,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Paper,
  Box,
  Select,
} from "@mui/material";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import { Pie, Radar } from "react-chartjs-2"; // Removed Bar

import {
  FaCode,
  FaBrain,
  FaRedoAlt,
  FaSun,
  FaMoon,
  FaSignOutAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaChartPie,
  FaList,
} from "react-icons/fa";
import { oneDark } from "@codemirror/theme-one-dark";
import "../styles/CodeEvaluator.css";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";

const CodeMirror = lazy(() => import("@uiw/react-codemirror"));

// Register ChartJS components
ChartJS.register(
  ArcElement,
  ChartTooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement
);

const API_URL = `$(REACT_APP_BACKEND_URL)/submit_code`;

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

const CodeEvaluator = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  );
  const [language, setLanguage] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("info");
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const reportRef = useRef(null);
  // const editorRef = useRef(null); // Removed unused editorRef

  // Check for token on component mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    console.log(token);
    if (!token) {
      setAlertMessage("Please log in first");
      setAlertSeverity("error");
      setAlertOpen(true);
      setTimeout(() => navigate("/login"), 2000);
    }
  }, [navigate]);

  const handleAnalyze = useCallback(async () => {
    const token = localStorage.getItem("authToken");
  
    // Check if token exists
    if (!token) {
      setAlertMessage("Please log in first");
      setAlertSeverity("error");
      setAlertOpen(true);
      setTimeout(() => navigate("/login"), 2000);
      return;
    }
  
    // Check if token is expired
    const decodedToken = jwtDecode(token);
    if (decodedToken.exp * 1000 < Date.now()) {
      setAlertMessage("Your session has expired. Please log in again.");
      setAlertSeverity("error");
      setAlertOpen(true);
      localStorage.removeItem("authToken");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }
   console.log(token);
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
      console.log(token);
      if (!token) {
        setAlertMessage("Please log in first");
        setAlertSeverity("error");
        setAlertOpen(true);
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      const response = await axios.post(
        "http://localhost:8000/submit_code",
        {
          code,
          language,
          course_level: "undergraduate",
          assignment_description: "Code analysis task",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response);
      if (response.data && response.data.plagiarism_analysis) {
        setAnalysisResult(response.data.plagiarism_analysis);
      } else {
        setAnalysisResult(response.data);
      }
    } catch (error) {
      console.error("Error analyzing code:", error);
      if (error.response) {
        if (error.response.status === 401) {
          localStorage.removeItem("authToken");
          setAlertMessage("Your session has expired. Please log in again.");
          setAlertSeverity("error");
          setAlertOpen(true);
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        setAlertMessage(
          `Error: ${error.response.data.detail || "Failed to analyze code."}`
        );
      } else if (error.request) {
        setAlertMessage(
          "No response received from the server. Please check your connection."
        );
      } else {
        setAlertMessage(`Request error: ${error.message}`);
      }
      setAlertSeverity("error");
      setAlertOpen(true);
      setAnalysisResult({ error: "Failed to analyze code." });
    } finally {
      setLoading(false);
    }
  }, [code, language, navigate]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (analysisResult && reportRef.current) {
      reportRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [analysisResult]);

  // Apply dark mode to the whole document
  useEffect(() => {
    // Apply dark mode to the body
    document.body.className = darkMode ? "dark-theme" : "light-theme";

    // Apply dark mode theme to html element for full page coverage
    const htmlElement = document.documentElement;
    if (darkMode) {
      htmlElement.classList.add("dark-theme");
    } else {
      htmlElement.classList.remove("dark-theme");
    }

    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        handleAnalyze();
      }
    };

    const editorElement = document.querySelector(".cm-editor");
    if (editorElement) {
      editorElement.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      if (editorElement) {
        editorElement.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [handleAnalyze]);

  const handleReset = () => {
    setCode("");
    setAnalysisResult(null);
  };

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userInfo");
    setIsAuthenticated(false);
    setUsername("");
    navigate("/");
  };

  const handleCodeChange = (value) => {
    if (!language) {
      setAlertMessage("Please select a language first!");
      setAlertSeverity("warning");
      setAlertOpen(true);
      return;
    }
    setCode(value);
  };

  const prepareMetricsChartData = () => {
    if (!analysisResult?.evaluation_metrics) return null;

    const { code_readability } = analysisResult.evaluation_metrics;

    // Set colors based on dark mode
    const borderColor = darkMode ? "rgb(96, 165, 250)" : "rgb(59, 130, 246)";
    const backgroundColor = darkMode
      ? "rgba(96, 165, 250, 0.2)"
      : "rgba(59, 130, 246, 0.2)";
    const pointBgColor = darkMode ? "rgb(96, 165, 250)" : "rgb(59, 130, 246)";

    const radarData = {
      labels: ["Readability", "Maintainability", "Efficiency", "Security"],
      datasets: [
        {
          label: "Code Quality",
          data: [
            code_readability.score,
            code_readability.score * 0.9,
            analysisResult.evaluation_metrics.code_efficiency
              .time_complexity === "O(n)"
              ? 8
              : 6,
            analysisResult.evaluation_metrics.code_security.issues_found
              .length === 0
              ? 10
              : 5,
          ],
          backgroundColor: backgroundColor,
          borderColor: borderColor,
          pointBackgroundColor: pointBgColor,
          pointBorderColor: darkMode ? "#1a1a1a" : "#fff",
          pointHoverBackgroundColor: darkMode ? "#1a1a1a" : "#fff",
          pointHoverBorderColor: borderColor,
        },
      ],
    };

    return radarData;
  };

  const preparePlagiarismChartData = () => {
    if (!analysisResult) return null;

    // Adapt colors for dark mode
    const originalColor = darkMode
      ? ["rgba(52, 211, 153, 0.6)", "rgba(52, 211, 153, 1)"]
      : ["rgba(16, 185, 129, 0.6)", "rgba(16, 185, 129, 1)"];

    const plagiarismColor = darkMode
      ? ["rgba(248, 113, 113, 0.6)", "rgba(248, 113, 113, 1)"]
      : ["rgba(239, 68, 68, 0.6)", "rgba(239, 68, 68, 1)"];

    const pieData = {
      labels: ["Original Code", "Potential Plagiarism"],
      datasets: [
        {
          data: [
            100 - analysisResult.confidence_score,
            analysisResult.confidence_score,
          ],
          backgroundColor: [originalColor[0], plagiarismColor[0]],
          borderColor: [originalColor[1], plagiarismColor[1]],
          borderWidth: 1,
        },
      ],
    };

    return pieData;
  };

  const renderAnalysisResult = () => {
    if (!analysisResult) return null;

    if (analysisResult.error) {
      return (
        <div className="error-message">
          <Paper
            elevation={3}
            sx={{
              p: 3,
              mt: 2,
              backgroundColor: darkMode ? "#2d2d2d" : "#fee2e2",
              color: darkMode ? "#f87171" : "#b91c1c",
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <FaExclamationTriangle />
              <Typography variant="h6">{analysisResult.error}</Typography>
            </Box>
          </Paper>
        </div>
      );
    }

    const pieData = preparePlagiarismChartData();
    const radarData = prepareMetricsChartData();

    // Chart options for dark/light mode
    const chartOptions = {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: darkMode ? "#f3f4f6" : "#111827",
            font: {
              family: "'Inter', sans-serif",
            },
          },
        },
        tooltip: {
          backgroundColor: darkMode ? "#374151" : "#ffffff",
          titleColor: darkMode ? "#f3f4f6" : "#111827",
          bodyColor: darkMode ? "#f3f4f6" : "#111827",
          borderColor: darkMode ? "#6b7280" : "#e5e7eb",
          borderWidth: 1,
        },
      },
    };
