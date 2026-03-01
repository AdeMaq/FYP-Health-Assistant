import React, { useState, useEffect } from "react";
import axios from "axios";

function VideoForm() {
    const [videos, setVideos] = useState([]);
    const [editVideo, setEditVideo] = useState(null);
    const [title, setTitle] = useState("");
    const [link, setLink] = useState("");
    const [tags, setTags] = useState("");

    const fetchVideos = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/videos");
            setVideos(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const videoData = { title, link, tags: tags.split(",") };

        try {
            if (editVideo) {
                await axios.put(`http://localhost:5000/api/videos/${editVideo.id}`, videoData);
            } else {
                await axios.post("http://localhost:5000/api/videos", videoData);
            }
            setTitle(""); setLink(""); setTags(""); setEditVideo(null);
            fetchVideos();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (video) => {
        setEditVideo(video);
        setTitle(video.title);
        setLink(video.link);
        setTags(video.tags.join(","));
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this video?")) {
            try {
                await axios.delete(`http://localhost:5000/api/videos/${id}`);
                fetchVideos();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleSeed = async () => {
        if (window.confirm("This will add JSON videos to the database. Proceed?")) {
            try {
                await axios.post("http://localhost:5000/api/videos/seed");
                fetchVideos();
                alert("Videos added successfully!");
            } catch (err) {
                console.error(err);
                alert(err.response?.data?.message || "Error seeding videos.");
            }
        }
    };


    return (
        <div>
            <h1>Manage Workouts</h1>
            {/* <button
                onClick={handleSeed}
                style={{ marginBottom: "20px", padding: "10px 15px", cursor: "pointer" }}
            >
                Push videos.json to DB
            </button> */}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
                <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Title"
                    style={{ marginRight: "5px" }}
                />
                <input
                    value={link}
                    onChange={e => setLink(e.target.value)}
                    placeholder="Link"
                    style={{ marginRight: "5px" }}
                />
                <input
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                    placeholder="Tags (comma-separated)"
                    style={{ marginRight: "5px" }}
                />
                <button type="submit">{editVideo ? "Update" : "Add"} Video</button>
            </form>

            {/* Video List */}
            <ul>
                {videos.map(video => (
                    <li key={video.id} style={{ marginBottom: "10px" }}>
                        <strong>{video.title}</strong> - {video.tags.join(", ")}
                        <button
                            style={{ marginLeft: "10px" }}
                            onClick={() => handleEdit(video)}
                        >
                            Edit
                        </button>
                        <button
                            style={{ marginLeft: "5px" }}
                            onClick={() => handleDelete(video.id)}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default VideoForm;
