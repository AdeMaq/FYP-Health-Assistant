// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// function Workout() {
//   const [prompt, setPrompt] = useState("");
//   const [response, setResponse] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   // NEW: State to track which video is currently playing
//   const [activeVideoId, setActiveVideoId] = useState(null);

//   const navigate = useNavigate();

//   // Helper to extract ID from YouTube URL
//   const getYouTubeID = (url) => {
//     const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
//     const match = url.match(regExp);
//     return (match && match[2].length === 11) ? match[2] : null;
//   };

//   const handleChatSubmit = async (e) => {
//     e.preventDefault();
//     if (!prompt.trim()) return;
//     setLoading(true);
//     setResponse(null);
//     setError("");
//     setActiveVideoId(null); // Reset player on new search

//     try {
//       const res = await axios.post("http://localhost:5000/api/videos/chat", { prompt });
//       setResponse(res.data);
//     } catch (err) {
//       setError("Something went wrong processing your request.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ padding: "30px", fontFamily: "Arial", maxWidth: "800px", margin: "0 auto" }}>
//       <h1>Fitness AI Chatbot</h1>

//       <form onSubmit={handleChatSubmit} style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
//         <input
//           type="text"
//           placeholder="Type your request here..."
//           value={prompt}
//           onChange={(e) => setPrompt(e.target.value)}
//           style={{ flex: 1, padding: "12px", fontSize: "16px", borderRadius: "5px", border: "1px solid #ccc" }}
//         />
//         <button type="submit" disabled={loading} style={{ padding: "12px 20px", cursor: "pointer", backgroundColor: "#007BFF", color: "white", border: "none", borderRadius: "5px" }}>
//           {loading ? "Thinking..." : "Send"}
//         </button>
//       </form>

//       {/* NEW: EMBEDDED PLAYER SECTION */}
//       {activeVideoId && (
//         <div style={{ marginBottom: "30px", backgroundColor: "#000", borderRadius: "10px", overflow: "hidden", aspectRatio: "16/9" }}>
//           <iframe
//             width="100%"
//             height="100%"
//             src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1`}
//             title="YouTube video player"
//             frameBorder="0"
//             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//             allowFullScreen
//           ></iframe>
//         </div>
//       )}

//       {response && response.videos && (
//         <div>
//           <h3>{response.message}</h3>
//           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
//             {response.videos.map((video, index) => (
//               <div key={index} style={{ border: "1px solid #ddd", borderRadius: "10px", padding: "15px", backgroundColor: "#f9f9f9" }}>
//                 <h4 style={{ marginTop: 0 }}>{video.title}</h4>
//                 <button
//                   onClick={() => navigate("/map", {
//                     state: {
//                       videoId: getYouTubeID(video.link),
//                       videoTitle: video.title
//                     }
//                   })}
//                   style={{
//                     width: "100%",
//                     padding: "10px",
//                     backgroundColor: "#28a745", // Green for mapping
//                     color: "white",
//                     border: "none",
//                     borderRadius: "5px",
//                     cursor: "pointer",
//                     fontWeight: "bold",
//                     marginTop: "5px"
//                   }}
//                 >
//                   Elongate to Map Posture
//                 </button>

//                 {/* MODIFIED: Button now updates state instead of opening new tab */}
//                 <button
//                   onClick={() => setActiveVideoId(getYouTubeID(video.link))}
//                   style={{
//                     width: "100%",
//                     padding: "10px",
//                     backgroundColor: activeVideoId === getYouTubeID(video.link) ? "#333" : "#FF0000",
//                     color: "white",
//                     border: "none",
//                     borderRadius: "5px",
//                     cursor: "pointer",
//                     fontWeight: "bold",
//                     marginTop: "10px"
//                   }}
//                 >
//                   {activeVideoId === getYouTubeID(video.link) ? "Now Playing" : "Watch Inside App"}
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Workout;





import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Workout() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // State to track which video is currently playing
  const [activeVideoId, setActiveVideoId] = useState(null);

  const navigate = useNavigate();

  // Helper to extract ID from YouTube URL
  const getYouTubeID = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse(null);
    setError("");
    setActiveVideoId(null); // Reset player on new search

    try {
      const res = await axios.post("http://localhost:5000/api/videos/chat", { prompt });
      setResponse(res.data);
    } catch (err) {
      setError("Something went wrong processing your request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Fitness AI Chatbot</h1>

      <form onSubmit={handleChatSubmit} style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Type your request here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{ flex: 1, padding: "12px", fontSize: "16px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <button type="submit" disabled={loading} style={{ padding: "12px 20px", cursor: "pointer", backgroundColor: "#007BFF", color: "white", border: "none", borderRadius: "5px" }}>
          {loading ? "Thinking..." : "Send"}
        </button>
      </form>

      {/* ERROR DISPLAY */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* EMBEDDED PLAYER SECTION */}
      {activeVideoId && (
        <div style={{ marginBottom: "30px", backgroundColor: "#000", borderRadius: "10px", overflow: "hidden", aspectRatio: "16/9" }}>
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}

      {response && response.videos && (
        <div>
          <h3>{response.message}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
            {response.videos.map((video, index) => (
              <div key={index} style={{ border: "1px solid #ddd", borderRadius: "10px", padding: "15px", backgroundColor: "#f9f9f9" }}>
                <h4 style={{ marginTop: 0 }}>{video.title}</h4>

                {/* BUTTON 1: WATCH IN APP */}
                <button
                  onClick={() => setActiveVideoId(getYouTubeID(video.link))}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: activeVideoId === getYouTubeID(video.link) ? "#333" : "#FF0000",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    marginTop: "10px"
                  }}
                >
                  {activeVideoId === getYouTubeID(video.link) ? "Now Playing" : "Watch Inside App"}
                </button>

                {/* BUTTON 2: ELONGATE TO MAP (NEW) */}
                <button
                  onClick={() => navigate("/map", {
                    state: {
                      videoId: getYouTubeID(video.link),
                      videoTitle: video.title
                    }
                  })}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#28a745", // Green for mapping
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    marginTop: "10px" // Spacing between the two buttons
                  }}
                >
                  Elongate to Map Posture
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Workout;