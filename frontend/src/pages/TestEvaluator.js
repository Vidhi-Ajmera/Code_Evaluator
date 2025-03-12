import React, { useState, useEffect, useRef } from "react";
import Split from "react-split";
import Editor from "@monaco-editor/react";
import { FaPlay, FaClock, FaRedo, FaSun, FaMoon, FaSignOutAlt } from "react-icons/fa";
import Switch from "@mui/material/Switch";
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Button } from '@mui/material';
import "../styles/TestEvaluator.css";
import { useNavigate } from "react-router-dom";

const CodeEvaluator = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("// Write your code here\n");
  const [input, setInput] = useState("3\n1\n2\n3\n3");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("select");
  const [time, setTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [theme, setTheme] = useState("vs-dark");
  const [darkMode, setDarkMode] = useState(true);
  const editorRef = useRef(null);
  const lastZoomLevel = useRef(window.devicePixelRatio);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const toggleTheme = () => {
    setDarkMode((prevMode) => !prevMode);
    setTheme((prevTheme) => (prevTheme === "vs-dark" ? "light" : "vs-dark"));
  };

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    setLogoutDialogOpen(false);
    navigate("/");
  };

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.onDidChangeModelContent((event) => {
      const firstLine = editor.getModel().getLineContent(1);
      if (firstLine !== "// Write your code here") {
        editor.executeEdits("", [
          {
            range: new monaco.Range(1, 1, 1, firstLine.length + 1),
            text: "// Write your code here",
          },
        ]);
      }
    });
  };

  useEffect(() => {
    if (editorRef.current && language !== "select") {
      import("monaco-editor").then((monaco) => {
        monaco.editor.setModelLanguage(editorRef.current.getModel(), language);
      });
    }
  }, [language]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins} min ${secs} sec` : `${secs} sec`;
  };

  useEffect(() => {
    let timer;
    if (isTimerRunning) {
      timer = setInterval(() => setTime((prev) => prev + 1), 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning]);

  const handleResize = () => {
    if (editorRef.current) {
      requestAnimationFrame(() => editorRef.current.layout());
    }
  };

  const detectZoomChange = () => {
    const currentZoomLevel = window.devicePixelRatio;
    if (currentZoomLevel !== lastZoomLevel.current) {
      lastZoomLevel.current = currentZoomLevel;
      handleResize();
    }
  };

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() =>
      requestAnimationFrame(handleResize)
    );
    const container = document.querySelector(".split-container");

    if (container) {
      resizeObserver.observe(container);
    }

    const zoomCheckInterval = setInterval(detectZoomChange, 200);

    return () => {
      resizeObserver.disconnect();
      clearInterval(zoomCheckInterval);
    };
  }, []);

  const handleReset = () => {
    alert("Code and timer reset successfully");
    setCode("// Write your code here\n");
    setTime(0);
    setIsTimerRunning(false);
  };

  const handleRun = () => {
    alert("Code executed successfully");
    setOutput("1 2  3\n2");
  };

  const handleSubmit = () => {
    alert("Code submitted successfully");
    setTime(0);
    setIsTimerRunning(false);
  };

  const toggleTimer = () => {
    if (!isTimerRunning) setTime(0);
    setIsTimerRunning(!isTimerRunning);
  };

  return (
    <Split
      className="split-container"
      sizes={[30, 70]}
      minSize={[250, 400]}
      expandToMin
      gutterSize={8}
      snapOffset={10}
      onDragEnd={handleResize}
    >
      <div className="left-panel">
        <h1>Problem Description</h1>
        <h3>Subset Sum Problem</h3>
        <p>
          Take an input N, a number. Take N more inputs and store that in an
          array. Take an input target, a number.
        </p>
        <p>
          a. Write a recursive function which prints subsets of the array which
          sum to target.
        </p>
        <p>
          b. Write a recursive function which counts the number of subsets of
          the array which sum to target. Print the value returned.
        </p>
        
        <h2>Sample Input:</h2>
        <pre className="example-box">3\n1\n2\n3\n3</pre>
        <h2>Sample Output:</h2>
        <pre className="example-box">1 2 3\n2</pre>

        <Button className="logout-button-main" onClick={handleLogout}>
          <FaSignOutAlt /> Log Out
        </Button>

        <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)}>
          <DialogTitle>Confirm Logout</DialogTitle>
          <DialogContent>
            <DialogContentText>Are you sure you want to log out?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLogoutDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmLogout} color="primary" className="logout-button">
              Log Out
            </Button>
          </DialogActions>
        </Dialog>
      </div>

      <div className="right-panel">
        <div className="top-bar">
          <select
            className="language-dropdown"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="select">Select Language</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
          </select>

          <div className="controls">
            <div className="theme-toggle">
              <FaSun className={`theme-icon ${!darkMode ? "rotate" : ""}`} />
              <Switch checked={darkMode} onChange={toggleTheme} color="default" />
              <FaMoon className={`theme-icon ${darkMode ? "rotate" : ""}`} />
            </div>
            <FaClock className="icon" onClick={toggleTimer} style={{ cursor: "pointer" }} />
            {isTimerRunning && <span className="timer-display">{formatTime(time)}</span>}
            {isTimerRunning && <button className="stop-btn" onClick={toggleTimer}>Stop</button>}
            <button onClick={handleRun} className="run-btn"><FaPlay className="icon-btn" /> Run</button>
            <button onClick={handleSubmit} className="submit-btn">Submit</button>
            <button onClick={handleReset} className="reset-btn"><FaRedo className="icon-btn" /> Reset</button>
          </div>
        </div>

        <div className="editor-container">
          <Editor
            defaultLanguage={language !== "select" ? language : "javascript"}
            theme={theme}
            value={language === "select" ? "Select a language you want to code" : code}
            onChange={(value) => language !== "select" && setCode(value)}
            onMount={handleEditorMount}
            options={{ fontSize: 13, readOnly: language === "select" }}
          />
        </div>

        <div className="console-area">
          <div className="console-box">
            <h2>Provide Custom Input</h2>
            <textarea className="console-input" value={input} onChange={(e) => setInput(e.target.value)} />
          </div>
          <div className="console-box">
            <h2>Output</h2>
            <pre className="console-output">{output}</pre>
          </div>
        </div>
      </div>
    </Split>
  );
};

export default CodeEvaluator;
