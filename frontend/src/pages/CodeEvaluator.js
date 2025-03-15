import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  lazy,
  Suspense,
} from "react";
import { useNavigate } from "react-router-dom";
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

const API_URL = "http://localhost:8000/submit_code"; // Ensure this matches your backend URL

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
    if (!token) {
      setAlertMessage("Please log in first");
      setAlertSeverity("error");
      setAlertOpen(true);
      setTimeout(() => navigate("/login"), 2000);
    }
  }, [navigate]);

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
        setAlertMessage("Please log in first");
        setAlertSeverity("error");
        setAlertOpen(true);
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      const response = await axios.post(
        API_URL,
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

    return (
      <>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card
              className="dashboard-card"
              sx={{
                height: "100%",
                backgroundColor: darkMode ? "#1f2937" : "white",
                color: darkMode ? "#f3f4f6" : "#111827",
                borderColor: darkMode ? "#374151" : "#e5e7eb",
                boxShadow: darkMode
                  ? "0 4px 6px rgba(0, 0, 0, 0.2)"
                  : "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <CardHeader
                title="Plagiarism Assessment"
                titleTypographyProps={{
                  variant: "h6",
                  color: darkMode ? "#f3f4f6" : "inherit",
                  fontWeight: 600,
                }}
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body1"
                        color={darkMode ? "#f3f4f6" : "inherit"}
                        sx={{ mb: 1 }}
                      >
                        <strong>Plagiarism Detected:</strong>{" "}
                        {analysisResult.plagiarism_detected ? (
                          <span
                            style={{ color: darkMode ? "#f87171" : "#ef4444" }}
                          >
                            Yes
                          </span>
                        ) : (
                          <span
                            style={{ color: darkMode ? "#34d399" : "#10b981" }}
                          >
                            No
                          </span>
                        )}
                      </Typography>
                      <Typography
                        color={darkMode ? "#f3f4f6" : "inherit"}
                        sx={{ mb: 1 }}
                      >
                        <strong>Confidence Score:</strong>{" "}
                        {analysisResult.confidence_score}%
                      </Typography>
                      <Typography color={darkMode ? "#f3f4f6" : "inherit"}>
                        <strong>Likely Source:</strong>{" "}
                        {analysisResult.likely_source}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ height: 200 }}>
                      {pieData && <Pie data={pieData} options={chartOptions} />}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              className="dashboard-card"
              sx={{
                height: "100%",
                backgroundColor: darkMode ? "#1f2937" : "white",
                color: darkMode ? "#f3f4f6" : "#111827",
                borderColor: darkMode ? "#374151" : "#e5e7eb",
                boxShadow: darkMode
                  ? "0 4px 6px rgba(0, 0, 0, 0.2)"
                  : "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <CardHeader
                title="Code Quality Metrics"
                titleTypographyProps={{
                  variant: "h6",
                  color: darkMode ? "#f3f4f6" : "inherit",
                  fontWeight: 600,
                }}
              />
              <CardContent>
                {radarData ? (
                  <Box height={200}>
                    <Radar data={radarData} options={chartOptions} />
                  </Box>
                ) : (
                  <Typography color={darkMode ? "#f3f4f6" : "inherit"}>
                    No metrics data available
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card
              className="dashboard-card"
              sx={{
                backgroundColor: darkMode ? "#1f2937" : "white",
                color: darkMode ? "#f3f4f6" : "#111827",
                borderColor: darkMode ? "#374151" : "#e5e7eb",
                boxShadow: darkMode
                  ? "0 4px 6px rgba(0, 0, 0, 0.2)"
                  : "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <CardHeader
                title="Analysis Explanation"
                titleTypographyProps={{
                  variant: "h6",
                  color: darkMode ? "#f3f4f6" : "inherit",
                  fontWeight: 600,
                }}
              />
              <CardContent>
                <Typography color={darkMode ? "#f3f4f6" : "inherit"}>
                  {analysisResult.explanation}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {analysisResult.suspicious_elements &&
            analysisResult.suspicious_elements.length > 0 && (
              <Grid item xs={12}>
                <Card
                  className="dashboard-card"
                  sx={{
                    backgroundColor: darkMode ? "#1f2937" : "white",
                    color: darkMode ? "#f3f4f6" : "#111827",
                    borderColor: darkMode ? "#374151" : "#e5e7eb",
                    boxShadow: darkMode
                      ? "0 4px 6px rgba(0, 0, 0, 0.2)"
                      : "0 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <CardHeader
                    title="Suspicious Elements"
                    titleTypographyProps={{
                      variant: "h6",
                      color: darkMode ? "#f3f4f6" : "inherit",
                      fontWeight: 600,
                    }}
                    avatar={
                      <FaExclamationTriangle
                        color={darkMode ? "#fbbf24" : "#f59e0b"}
                      />
                    }
                  />
                  <CardContent>
                    <Grid container spacing={2}>
                      {analysisResult.suspicious_elements.map(
                        (element, index) => (
                          <Grid item xs={12} md={6} key={index}>
                            <Paper
                              elevation={2}
                              sx={{
                                p: 2,
                                backgroundColor: darkMode
                                  ? "#374151"
                                  : "#fff7ed",
                                borderLeft: `4px solid ${
                                  darkMode ? "#fbbf24" : "#f59e0b"
                                }`,
                                color: darkMode ? "#f3f4f6" : "inherit",
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  fontWeight: "bold",
                                  mb: 1,
                                  color: darkMode ? "#f3f4f6" : "inherit",
                                }}
                              >
                                Element {index + 1}
                              </Typography>
                              <Box
                                sx={{
                                  backgroundColor: darkMode
                                    ? "#1f2937"
                                    : "#f9fafb",
                                  p: 1,
                                  borderRadius: 1,
                                  mb: 1,
                                  maxHeight: "150px",
                                  overflow: "auto",
                                }}
                              >
                                <pre className={darkMode ? "dark-pre" : ""}>
                                  {element.code_section}
                                </pre>
                              </Box>
                              <Typography
                                color={darkMode ? "#f3f4f6" : "inherit"}
                                sx={{ mb: 1 }}
                              >
                                <strong>Likely Source:</strong>{" "}
                                {element.likely_source}
                              </Typography>
                              <Typography
                                color={darkMode ? "#f3f4f6" : "inherit"}
                                sx={{ mb: 1 }}
                              >
                                <strong>Confidence:</strong>{" "}
                                {element.confidence}%
                              </Typography>
                              <Typography
                                color={darkMode ? "#f3f4f6" : "inherit"}
                              >
                                <strong>Explanation:</strong>{" "}
                                {element.explanation}
                              </Typography>
                            </Paper>
                          </Grid>
                        )
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

          {analysisResult.evaluation_metrics && (
            <Grid item xs={12}>
              <Card
                className="dashboard-card"
                sx={{
                  backgroundColor: darkMode ? "#1f2937" : "white",
                  color: darkMode ? "#f3f4f6" : "#111827",
                  borderColor: darkMode ? "#374151" : "#e5e7eb",
                  boxShadow: darkMode
                    ? "0 4px 6px rgba(0, 0, 0, 0.2)"
                    : "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              >
                <CardHeader
                  title="Detailed Code Evaluation"
                  titleTypographyProps={{
                    variant: "h6",
                    color: darkMode ? "#f3f4f6" : "inherit",
                    fontWeight: 600,
                  }}
                  avatar={
                    <FaChartPie color={darkMode ? "#60a5fa" : "#3b82f6"} />
                  }
                />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2,
                          backgroundColor:
                            analysisResult.evaluation_metrics.code_correctness
                              .status === "Passed"
                              ? darkMode
                                ? "#064e3b"
                                : "#ecfdf5"
                              : darkMode
                              ? "#7f1d1d"
                              : "#fef2f2",
                          height: "100%",
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: "bold",
                            mb: 1,
                            color: darkMode ? "#f3f4f6" : "inherit",
                          }}
                        >
                          Code Correctness
                        </Typography>
                        <Typography
                          sx={{
                            color:
                              analysisResult.evaluation_metrics.code_correctness
                                .status === "Passed"
                                ? darkMode
                                  ? "#34d399"
                                  : "#059669"
                                : darkMode
                                ? "#f87171"
                                : "#dc2626",
                            fontWeight: 600,
                          }}
                        >
                          <strong>Status:</strong>{" "}
                          {
                            analysisResult.evaluation_metrics.code_correctness
                              .status
                          }
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2,
                          backgroundColor: darkMode ? "#172554" : "#eff6ff",
                          height: "100%",
                          color: darkMode ? "#f3f4f6" : "inherit",
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: "bold",
                            mb: 1,
                            color: darkMode ? "#f3f4f6" : "inherit",
                          }}
                        >
                          Code Efficiency
                        </Typography>
                        <Typography color={darkMode ? "#f3f4f6" : "inherit"}>
                          <strong>Time Complexity:</strong>{" "}
                          {
                            analysisResult.evaluation_metrics.code_efficiency
                              .time_complexity
                          }
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2,
                          backgroundColor:
                            analysisResult.evaluation_metrics.code_security
                              .issues_found.length === 0
                              ? darkMode
                                ? "#064e3b"
                                : "#ecfdf5"
                              : darkMode
                              ? "#7f1d1d"
                              : "#fef2f2",
                          height: "100%",
                          color: darkMode ? "#f3f4f6" : "inherit",
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: "bold",
                            mb: 1,
                            color: darkMode ? "#f3f4f6" : "inherit",
                          }}
                        >
                          Code Security
                        </Typography>
                        {analysisResult.evaluation_metrics.code_security
                          .issues_found.length > 0 ? (
                          <>
                            <Typography
                              sx={{
                                color: darkMode ? "#f87171" : "#dc2626",
                                mb: 1,
                              }}
                            >
                              <strong>
                                Issues Found:{" "}
                                {
                                  analysisResult.evaluation_metrics
                                    .code_security.issues_found.length
                                }
                              </strong>
                            </Typography>
                            <Box
                              sx={{
                                maxHeight: "150px",
                                overflow: "auto",
                                pr: 1,
                              }}
                            >
                              <ul
                                style={{
                                  color: darkMode ? "#f3f4f6" : "inherit",
                                  paddingLeft: "20px",
                                }}
                              >
                                {analysisResult.evaluation_metrics.code_security.issues_found.map(
                                  (issue, i) => (
                                    <li key={i}>{issue}</li>
                                  )
                                )}
                              </ul>
                            </Box>
                          </>
                        ) : (
                          <Typography
                            sx={{ color: darkMode ? "#34d399" : "#059669" }}
                          >
                            <strong>No security issues found</strong>
                          </Typography>
                        )}
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2,
                          backgroundColor: darkMode ? "#1e3a8a" : "#eef2ff",
                          height: "100%",
                          color: darkMode ? "#f3f4f6" : "inherit",
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: "bold",
                            mb: 1,
                            color: darkMode ? "#f3f4f6" : "inherit",
                          }}
                        >
                          Code Readability
                        </Typography>
                        <Typography color={darkMode ? "#f3f4f6" : "inherit"}>
                          <strong>Score:</strong>{" "}
                          {
                            analysisResult.evaluation_metrics.code_readability
                              .score
                          }
                          /10
                        </Typography>
                        <Box
                          sx={{
                            mt: 1,
                            width: "100%",
                            bgcolor: darkMode ? "#475569" : "#e2e8f0",
                            borderRadius: 1,
                            height: 10,
                          }}
                        >
                          <Box
                            sx={{
                              width: `${
                                analysisResult.evaluation_metrics
                                  .code_readability.score * 10
                              }%`,
                              bgcolor:
                                analysisResult.evaluation_metrics
                                  .code_readability.score >= 7
                                  ? darkMode
                                    ? "#34d399"
                                    : "#10b981"
                                  : analysisResult.evaluation_metrics
                                      .code_readability.score >= 4
                                  ? darkMode
                                    ? "#fbbf24"
                                    : "#f59e0b"
                                  : darkMode
                                  ? "#f87171"
                                  : "#ef4444",
                              height: "100%",
                              borderRadius: 1,
                            }}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          <Grid item xs={12}>
            <Card
              className="dashboard-card"
              sx={{
                backgroundColor: darkMode ? "#1f2937" : "white",
                color: darkMode ? "#f3f4f6" : "#111827",
                borderColor: darkMode ? "#374151" : "#e5e7eb",
                boxShadow: darkMode
                  ? "0 4px 6px rgba(0, 0, 0, 0.2)"
                  : "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <CardHeader
                title="Improvement Recommendations"
                titleTypographyProps={{
                  variant: "h6",
                  color: darkMode ? "#f3f4f6" : "inherit",
                  fontWeight: 600,
                }}
                avatar={<FaList color={darkMode ? "#34d399" : "#10b981"} />}
              />
              <CardContent>
                <Grid container spacing={2}>
                  {analysisResult.recommendations.map((rec, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2,
                          backgroundColor: darkMode ? "#374151" : "#f0fdf4",
                          height: "100%",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1,
                          color: darkMode ? "#f3f4f6" : "inherit",
                        }}
                      >
                        <Box
                          sx={{
                            color: darkMode ? "#34d399" : "#10b981",
                            pt: 0.5,
                          }}
                        >
                          <FaCheckCircle />
                        </Box>
                        <Typography color={darkMode ? "#f3f4f6" : "inherit"}>
                          {rec}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </>
    );
  };

  // Theme configuration for MUI components
  // const themeStyles = { ... }; // Removed unused themeStyles

  return (
    <>
      <div
        className="theme-toggle"
        style={{ backgroundColor: darkMode ? "#374151" : "#ffffff" }}
      >
        <FaSun
          className={`theme-icon ${!darkMode ? "active-icon" : ""}`}
          style={{ color: darkMode ? "#f3f4f6" : "#f59e0b" }}
        />
        <Switch
          checked={darkMode}
          onChange={toggleDarkMode}
          color="default"
          sx={{
            "& .MuiSwitch-track": {
              backgroundColor: darkMode ? "#6b7280 !important" : undefined,
            },
            "& .MuiSwitch-thumb": {
              backgroundColor: darkMode ? "#f3f4f6" : undefined,
            },
          }}
        />
        <FaMoon
          className={`theme-icon ${darkMode ? "active-icon" : ""}`}
          style={{ color: darkMode ? "#60a5fa" : "#6b7280" }}
        />
      </div>
      <div
        className="language-selector"
        style={{
          position: "absolute",
          top: "8px",
          left: "8px",
          zIndex: 10,
        }}
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
      {/* Apply dark-theme class to the container */}
      <div className={`container ${darkMode ? "dark-theme" : "light-theme"}`}>
        <Typography
          variant="h5"
          className="title"
          onClick={scrollToTop}
          sx={{
            color: darkMode ? "#f3f4f6" : "#111827",
            textAlign: "center",
            width: "100%", // Ensures it spans the full width for proper centering
          }}
        >
          <FaCode
            style={{
              marginRight: "8px",
              color: darkMode ? "#60a5fa" : "#3b82f6",
            }}
          />
          CodeIQ.ai
        </Typography>

        {/* Apply dark-theme class to the top-section */}
        <div
          className={`top-section ${darkMode ? "dark-theme" : "light-theme"}`}
        >
          <div
            className={`editor-container ${darkMode ? "dark-theme" : ""}`}
            style={{ borderColor: darkMode ? "#4b5563" : "#e5e7eb" }}
          >
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
                readOnly={!language}
                style={{
                  fontSize: "1rem",
                  height: "100%",
                  color: darkMode ? "#f3f4f6" : "#111827",
                  backgroundColor: darkMode ? "#2d2d2d" : "#ffffff",
                }}
              />
            </Suspense>
          </div>

          {analysisResult && (
            <div
              className={`analysis-container ${darkMode ? "dark-theme" : ""}`}
              ref={reportRef}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <FaChartPie
                  style={{
                    marginRight: "10px",
                    color: darkMode ? "#60a5fa" : "#3b82f6",
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: darkMode ? "#f3f4f6" : "#111827",
                  }}
                >
                  Analysis Report
                </Typography>
              </Box>
              {renderAnalysisResult()}
            </div>
          )}
          <div className="button-container">
            <Button
              className="reset-button"
              onClick={handleReset}
              variant="contained"
              color="error"
            >
              <FaRedoAlt className="button-icon" />
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
                  variant="contained"
                  color="primary"
                >
                  {loading ? (
                    <CircularProgress size={20} style={{ color: "white" }} />
                  ) : (
                    <>
                      <FaBrain className="button-icon" />
                      <span>Analyze Code</span>
                    </>
                  )}
                </Button>
              </span>
            </Tooltip>
          </div>

          <Button
            className="logout-button-main"
            onClick={handleLogout}
            variant="contained"
            color="error"
            startIcon={<FaSignOutAlt />}
          >
            Log Out
          </Button>
          <Dialog
            open={logoutDialogOpen}
            onClose={() => setLogoutDialogOpen(false)}
            PaperProps={{
              style: {
                backgroundColor: darkMode ? "#2d2d2d" : "white",
                color: darkMode ? "white" : "inherit",
              },
            }}
          >
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogContent>
              <DialogContentText
                sx={{ color: darkMode ? "#e2e8f0" : "inherit" }}
              >
                Are you sure you want to log out?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setLogoutDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={confirmLogout}
                color="error"
                variant="contained"
                className="logout-button"
              >
                Log Out
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={alertOpen}
            autoHideDuration={3000}
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
      </div>
    </>
  );
};

export default CodeEvaluator;
