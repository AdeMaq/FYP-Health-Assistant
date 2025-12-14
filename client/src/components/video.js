// src/components/video.js
import React, { useState } from "react";
import axios from "axios";

function Video() {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState([]);

  const API_KEY = "AIzaSyCb73SuzmGQnH91nP0I3vEqXqcUQY8gVcY";

  const fetchVideos = async () => {
    if (!query.trim()) return;

    try {
      const response = await axios.get(
        "https://www.googleapis.com/youtube/v3/search",
        {
          params: {
            part: "snippet",
            q: query,
            type: "video",
            maxResults: 3,
            order: "date",
            key: API_KEY,
          },
        }
      );

      const items = response.data.items.map((item) => ({
        id: item.id.videoId,
        title: item.snippet.title,
      }));

      setVideos(items);
    } catch (error) {
      console.error(error);
      alert("Error fetching videos");
    }
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>Latest Exercise Videos</h1>

      <input
        type="text"
        placeholder="Enter exercise name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "300px",
          padding: "10px",
          marginRight: "10px",
          fontSize: "16px",
        }}
      />

      <button
        onClick={fetchVideos}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Search
      </button>

      <ul style={{ marginTop: "20px" }}>
        {videos.map((video) => (
          <li key={video.id} style={{ marginBottom: "10px" }}>
            <a
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "18px" }}
            >
              {video.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Video;