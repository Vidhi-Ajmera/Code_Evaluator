import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaCode } from "react-icons/fa";
import { Home, CalendarRange } from "lucide-react";
import { faMedal } from "@fortawesome/free-solid-svg-icons";
import "../styles/Contest.css";
import { useNavigate } from "react-router-dom";

const liveContests = [
  { title: "Basics of Programming & Introduction to Java", problems: 5 },
  { title: "Basics of Programming & Introduction to Python", problems: 5 },
  { title: "Basics of Programming & Introduction to JavaScript", problems: 5 },
  { title: "Basics of Programming & Introduction to C++", problems: 5 },
  { title: "Arrays & Basic Problems Contest", problems: 10 },
  { title: "String Manipulation & Pattern Matching", problems: 10 },
  { title: "Searching & Binary Search Algorithms", problems: 10 },
  { title: "Sorting Algorithms Practice Contest", problems: 10 },
  { title: "Two Pointers & Sliding Window Problems", problems: 10 },
  { title: "Hashing & HashMap Based Problems", problems: 10 },
  { title: "Linked List Mastery Contest", problems: 10 },
  { title: "Stacks & Queues Practice Contest", problems: 10 },
];

const upcomingContests = [
  { title: "Trees & Binary Trees Challenge", problems: 10 },
  { title: "Binary Search Trees (BST) & Operations", problems: 10 },
  { title: "Graphs & Traversals Marathon", problems: 10 },
  { title: "Recursion & Backtracking Contest", problems: 10 },
  { title: "Dynamic Programming (DP) Basics", problems: 10 },
  { title: "Heaps & Priority Queue Contest", problems: 10 },
  { title: "Greedy Algorithms & Optimization", problems: 10 },
  { title: "Bit Manipulation & Tricks", problems: 10 },
  { title: "Trie & Advanced String Algorithms", problems: 10 },
  { title: "Graphs Advanced (Shortest Paths, MST)", problems: 10 },
  { title: "Complete DSA Mock Test (Mixed Topics)", problems: 20 },
];

const CustomizedContests = [{ title: "Practice Contest 1", problems: 10 }];

const Contest = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Live");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedContest, setSelectedContest] = useState(null);
  const contestsPerPage = 9;

  const handleViewContest = (contest) => {
    setSelectedContest(contest);
    setShowModal(true);
  };

  const handleConfirmParticipation = () => {
    setShowModal(false);
    // navigate(`/contest/${selectedContest.title}`);
    // navigate("/test-platform");
    navigate("/difficulty");
  };

  const handleCancelParticipation = () => {
    setShowModal(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  // Filter and paginate contests
  const getFilteredContests = () => {
    const contests =
      activeTab === "Live"
        ? liveContests
        : activeTab === "Upcoming"
        ? upcomingContests
        : CustomizedContests;
    return contests.filter((contest) =>
      contest.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const paginatedContests = () => {
    const filtered = getFilteredContests();
    const startIndex = (currentPage - 1) * contestsPerPage;
    return filtered.slice(startIndex, startIndex + contestsPerPage);
  };

  const totalContests = getFilteredContests().length;
  const totalPages = Math.ceil(totalContests / contestsPerPage);
  const startItem = (currentPage - 1) * contestsPerPage + 1;
  const endItem = Math.min(currentPage * contestsPerPage, totalContests);

  // Render each contest card
  const renderContests = (contests, isLive) =>
    contests.map((contest, index) => (
      <div
        key={index}
        className={`contest-card ${isLive ? "live-contest" : ""}`}
      >
        <div className="card-header">
          <div className="card-title">
            <FontAwesomeIcon icon={faMedal} className="fa-icon" />
            <h3>{contest.title}</h3>
          </div>
          <div className="contest-stats">
            <div className="number">{contest.problems}</div>
            <div className="label">Problems</div>
          </div>
        </div>
        <div className="card-footer">
          <button
            className="view-btn"
            onClick={() => handleViewContest(contest)}
          >
            View Contest
          </button>
        </div>
      </div>
    ));

  return (
    <div className="contest-wrapper" style={{ backgroundColor: "white" }}>
      <div className="contest-header">
        <div className="heading-wrapper">
          <FaCode className="code-icon" />
          {/* <h1>Solve Curated Contests</h1> */}
          <h1>Think. Code. SkillUp.</h1>
        </div>
        <p>
          Challenge yourself, sharpen your skills, and rise to the top in our
          thrilling live and upcoming contests!
        </p>
      </div>

      <div className="tab-container">
        <button
          className={`tab-btn ${activeTab === "Live" ? "active" : ""}`}
          onClick={() => handleTabChange("Live")}
        >
          <Home
            size={23}
            style={{
              marginRight: "8px",
              color: "beige",
              borderRadius: "5px",
              padding: "1px",
            }}
          />
          Live Contests
        </button>
        <button
          className={`tab-btn ${activeTab === "Upcoming" ? "active" : ""}`}
          onClick={() => handleTabChange("Upcoming")}
        >
          <CalendarRange
            size={20}
            style={{
              marginRight: "8px",
              color: "beige",
              borderRadius: "5px",
              padding: "1px",
            }}
          />
          Upcoming Contests
        </button>
        <button
          className={`tab-btn ${activeTab === "Customized" ? "active" : ""}`}
          onClick={() => navigate("./Customized")}
        >
          <CalendarRange
            size={20}
            style={{
              marginRight: "8px",
              color: "beige",
              borderRadius: "5px",
              padding: "1px",
            }}
          />
          Customized Contests
        </button>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search contest by name..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>
      <div className="contest-container">
        {renderContests(paginatedContests(), activeTab === "Live")}
      </div>

      {totalContests > contestsPerPage && (
        <div className="pagination-controls">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            &lt; Prev
          </button>
          <span className="pagination-info">
            {startItem} - {endItem} of {totalContests}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next &gt;
          </button>
        </div>
      )}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Confirm Participation</h2>
            <p>
              Are you sure you want to participate in "{selectedContest.title}"?
            </p>
            <div className="modal-actions">
              <button
                onClick={handleConfirmParticipation}
                className="modal-btn confirm"
              >
                Yes, Participate
              </button>
              <button
                onClick={handleCancelParticipation}
                className="modal-btn cancel"
              >
                No, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Contest;
