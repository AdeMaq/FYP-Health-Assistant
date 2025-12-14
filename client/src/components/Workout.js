import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Workout() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse(null);
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/videos/chat", {
        prompt: prompt,
      });
      setResponse(res.data);
    } catch (err) {
      console.error("Error getting recommendation:", err);
      setError("Something went wrong processing your request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Fitness AI Chatbot</h1>
      <p>Tell me what you want to work on (e.g., "I want a 10 minute abs workout")</p>

      {/* Input Area */}
      <form onSubmit={handleChatSubmit} style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Type your request here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{ flex: 1, padding: "12px", fontSize: "16px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 20px",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
            backgroundColor: "#007BFF",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </form>

      <button
        onClick={() => navigate("/manage")}
        style={{ padding: "8px 15px", fontSize: "14px", cursor: "pointer", marginBottom: "20px" }}
      >
        Manage Database
      </button>

      {/* Result Display */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Check if we have response and videos array */}
      {response && response.videos && (
        <div>
          <h3>{response.message}</h3>
          <p style={{ fontSize: "12px", color: "#666", marginBottom:"20px" }}>
            Source: {response.source === "database" ? "Existing Database" : "YouTube & Database"}
          </p>

          {/* Grid Container for Videos */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
            gap: "20px" 
          }}>
            
            {response.videos.map((video, index) => (
              <div key={index} style={{ 
                border: "1px solid #ddd", 
                borderRadius: "10px", 
                padding: "15px", 
                backgroundColor: "#f9f9f9",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}>
                <div>
                  <h4 style={{marginTop: 0}}>{video.title}</h4>
                  <div style={{ marginBottom: "15px" }}>
                      {video.tags && video.tags.map((tag, i) => (
                          <span key={i} style={{ 
                              backgroundColor: "#eee", 
                              padding: "2px 6px", 
                              borderRadius: "4px", 
                              margin: "0 4px 4px 0",
                              fontSize: "11px",
                              display: "inline-block"
                          }}>
                              #{tag}
                          </span>
                      ))}
                  </div>
                </div>
                
                <a 
                    href={video.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                        display: "block",
                        padding: "10px",
                        backgroundColor: "#FF0000",
                        color: "white",
                        textDecoration: "none",
                        borderRadius: "5px",
                        textAlign: "center",
                        fontWeight: "bold",
                        marginTop: "10px"
                    }}
                >
                    Watch Video
                </a>
              </div>
            ))}

          </div>
        </div>
      )}
    </div>
  );
}

export default Workout;