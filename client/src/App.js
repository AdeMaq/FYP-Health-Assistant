import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Workout from "./components/Workout";
import VideoForm from "./components/VideoForm";
import TagsManagement from "./components/TagsManagement";

function App() {
  return (
    <Router>
      <div style={styles.appWrapper}>

        {/* Navigation Bar */}
        <nav style={styles.navbar}>
          <div style={styles.logo}>
            🏋️ Fitness Chatbot
          </div>

          <div style={styles.navLinks}>
            <Link to="/" style={styles.link}>
              Chatbot
            </Link>
            <Link to="/manage" style={styles.link}>
              Manage Videos
            </Link>
            <Link to="/tags" style={styles.link}>
              Manage Logic
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <div style={styles.content}>
          <Routes>
            <Route path="/" element={<Workout />} />
            <Route path="/manage" element={<VideoForm />} />
            <Route path="/tags" element={<TagsManagement />} />
          </Routes>
        </div>

      </div>
    </Router>
  );
}

const styles = {
  appWrapper: {
    minHeight: "100vh",
    backgroundColor: "#f7f7f7",
    fontFamily: "Inter, Arial, sans-serif",
    color: "#000"
  },

  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 30px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #ddd",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
  },

  logo: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#000"
  },

  navLinks: {
    display: "flex",
    gap: "20px"
  },

  link: {
    textDecoration: "none",
    color: "#000",
    fontWeight: "500",
    padding: "6px 10px",
    borderRadius: "6px",
    transition: "background 0.2s"
  },

  content: {
    maxWidth: "1100px",
    margin: "30px auto",
    backgroundColor: "#fff",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)"
  }
};

export default App;
