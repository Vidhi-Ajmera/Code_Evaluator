import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMedal } from "@fortawesome/free-solid-svg-icons";
import { FaCode } from "react-icons/fa";
import "../styles/Difficulty.css";

const difficulties = [
  {
    title: "Easy",
    numProblems: 10,
    description: "Basic problems to get started.",
    color: "easy-color",
  },
  {
    title: "Medium",
    numProblems: 10,
    description: "Intermediate problems to level up your skills.",
    color: "medium-color",
  },
  {
    title: "Hard",
    numProblems: 10,
    description: "Advanced challenges for experienced coders.",
    color: "hard-color",
  },
  {
    title: "Expert",
    numProblems: 10,
    description: "Expert-level problems for the best of the best.",
    color: "expert-color",
  },
];

const DifficultySelection = () => {
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleConfirmSelection = () => {
    setShowModal(false);
    navigate("/test-platform", { state: { difficulty: selectedDifficulty } });
  };

  const handleCancelSelection = () => {
    setShowModal(false);
  };

  const handleAttemptContest = (difficulty, e) => {
    e.stopPropagation(); // Prevent triggering card click event
    setSelectedDifficulty(difficulty);
    setShowModal(true); // Show confirmation modal
  };

  return (
    <div className="difficulty-wrapper">
      <div className="difficulty-header">
        <div className="heading-wrapper">
          <FaCode className="code-icon" />
          <h1>Think. Code. SkillUp.</h1>
        </div>
        <p>Challenge yourself, sharpen your skills, and rise to the top!</p>
      </div>
      <div className="difficulty-container">
        {difficulties.map((difficulty, index) => (
          <div key={index} className={`difficulty-card ${difficulty.color}`}>
            <div className="card-header">
              <FontAwesomeIcon icon={faMedal} className="fa-icon" />
              <h3>{difficulty.title}</h3>
            </div>
            <p className="problem-count">Problems: {difficulty.numProblems}</p>
            <p className="difficulty-description">{difficulty.description}</p>

            {/* Attempt Contest Button */}
            <button
              className="attempt-contest-btn"
              onClick={(e) => handleAttemptContest(difficulty, e)}
            >
              Attempt Contest
            </button>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>🚀 Ready to Challenge Yourself?</h2>
            </div>
            <p className="modal-text">
              Are you sure to attempt the{" "}
              <strong>"{selectedDifficulty?.title}"</strong> contest! <br />
              Give it your best shot and enhance your skills!
            </p>
            <div className="modal-actions">
              <button
                onClick={handleConfirmSelection}
                className="modal-btn confirm"
              >
                Yes, Start Contest
              </button>
              <button
                onClick={handleCancelSelection}
                className="modal-btn cancel"
              >
                No, Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DifficultySelection;
