import React, { useState } from "react";
import "../styles/Customized.css";

const allowedTopics = {
  MCQ: [
    "Data Structures",
    "Algorithms",
    "Operating Systems",
    "Computer Networks",
    "Theory of Computation",
    "Compiler Design",
    "Database Management",
    "Software Engineering",
    "Discrete Mathematics",
    "Human-Computer Interaction",
    "Cybersecurity",
    "Machine Learning Concepts",
    "Artificial Intelligence Basics",
  ],
  Coding: [
    "Arrays",
    "Strings",
    "Linked Lists",
    "Stacks",
    "Queues",
    "Trees",
    "Binary Trees",
    "Binary Search Trees",
    "Heaps",
    "Tries",
    "Graphs",
    "Dynamic Programming",
    "Greedy Algorithms",
    "Graph Theory",
    "Sorting and Searching",
    "Recursion",
    "Backtracking",
    "String Manipulation",
    "Bit Manipulation",
    "Number Theory",
    "Mathematical Algorithms",
    "Divide and Conquer",
    "Hashing",
    "Sliding Window",
    "Union-Find",
    "Topological Sorting",
    "Shortest Path Algorithms",
    "Minimum Spanning Tree",
  ],
  "Fill in the Blanks": [
    "Python Syntax",
    "Java Basics",
    "SQL Queries",
    "HTML Tags",
    "CSS Properties",
    "JavaScript Concepts",
    "React Components",
  ],
  "True/False": [
    "Machine Learning Concepts",
    "Artificial Intelligence Basics",
    "Data Science Pipelines",
    "Cloud Computing Fundamentals",
    "Blockchain Security",
    "Web Development Principles",
  ],
};

const CustomizedContestForm = () => {
  const [participantName, setParticipantName] = useState("");
  const [contestName, setContestName] = useState("");
  const [numOfQuestions, setNumOfQuestions] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [questionType, setQuestionType] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [topic, setTopic] = useState("");
  const [topics, setTopics] = useState([]);
  const [description, setDescription] = useState("");

  const handleAddTopic = () => {
    if (
      topic.trim() !== "" &&
      !topics.includes(topic) &&
      allowedTopics[questionType]?.includes(topic)
    ) {
      setTopics([...topics, topic]);
      setTopic("");
    }
  };

  const handleRemoveTopic = (index) => {
    const updatedTopics = topics.filter((_, i) => i !== index);
    setTopics(updatedTopics);
  };

  const handleTopicChange = (e) => {
    setTopic(e.target.value);
  };

  const filteredTopics = allowedTopics[questionType]?.filter((t) =>
    t.toLowerCase().includes(topic.toLowerCase())
  );

  const handleTopicClick = (suggestedTopic) => {
    setTopic(suggestedTopic);
    handleAddTopic();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newContest = {
      participantName,
      contestName,
      numOfQuestions,
      difficulty,
      questionType,
      timeLimit,
      topics,
      description,
    };
    console.log("New Customized Contest:", newContest);
    alert("Contest created successfully!");
  };

  return (
    <div className="create-contest-form">
      <h2>Challenge Yourself! Create Your Own Contest</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Participant Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Contest Name</label>
          <input
            type="text"
            placeholder="Enter contest name"
            value={contestName}
            onChange={(e) => setContestName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Number of Questions</label>
          <input
            type="number"
            placeholder="Enter number of questions"
            value={numOfQuestions}
            onChange={(e) => setNumOfQuestions(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Question Type</label>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            required
          >
            <option value="MCQ">Select</option>
            <option value="MCQ">MCQ</option>
            <option value="Coding">Coding</option>
            <option value="Fill in the Blanks">Fill in the Blanks</option>
            <option value="True/False">True/False</option>
          </select>
        </div>

        <div className="form-group">
          <label>Topics</label>
          <div className="topic-input">
            <input
              type="text"
              placeholder={
                questionType ? "Enter a topic" : "Select a question type first"
              }
              value={topic}
              onChange={handleTopicChange}
              style={{ width: "65%" }}
              disabled={!questionType}
            />

            <button
              type="button"
              onClick={handleAddTopic}
              className="add-topic-btn"
              style={{ fontSize: "1rem", width: "30%", marginBottom: "20px" }}
              disabled={!questionType} // Disable button if no question type is selected
            >
              Add Topic
            </button>
            {topic && filteredTopics?.length > 0 && (
              <ul className="suggestions-list">
                {filteredTopics.map((suggestedTopic, index) => (
                  <li
                    key={index}
                    onClick={() => handleTopicClick(suggestedTopic)}
                    className="suggestion-item"
                  >
                    {suggestedTopic}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <ul className="topic-list">
            {topics.map((t, index) => (
              <li
                key={index}
                className="topic-item"
                style={{
                  color: "black",
                  lineHeight: "1.5rem", // Adjust line height for better spacing
                  height: "3rem", // Use auto to let it adjust naturally
                  padding: "10px 38px", // Add some padding for better visibility
                }}
              >
                {t}
                <button
                  type="button"
                  onClick={() => handleRemoveTopic(index)}
                  className="remove-topic-btn"
                  style={{
                    backgroundColor: "black",
                    color: "black",
                    border: "none",
                    borderRadius: "20%",
                    padding: "5px 6px",
                    cursor: "pointer",
                    marginLeft: "8px",
                    width: "1.9rem", // Adjusted width
                    height: "2.2rem", // Adjusted height for a circular look
                    marginBottom: "3%",
                  }}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button
          type="submit"
          className="create-contest-btn"
          style={{ fontSize: "1.3rem", width: "100%" }}
        >
          Create Contest
        </button>
      </form>
    </div>
  );
};

export default CustomizedContestForm;
