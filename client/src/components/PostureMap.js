import React, { useRef, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { Pose, POSE_CONNECTIONS } from "@mediapipe/pose";
import * as cam from "@mediapipe/camera_utils";
import { drawConnectors } from "@mediapipe/drawing_utils";

// --- CONFIGURATION CONSTANTS ---
const BODY_PARTS = {
    FACE: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    ARMS_SHOULDER_NECK: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
    MIDDLE_ABDOMEN: [23, 24],
    HIPS_LEGS: [25, 26, 27, 28, 29, 30, 31, 32]
};

const DEFAULT_COLORS = {
    FACE: "#FF00FF",            // Magenta
    ARMS_SHOULDER_NECK: "#00BFFF", // Deep Sky Blue
    MIDDLE_ABDOMEN: "#FFFF00",  // Yellow
    HIPS_LEGS: "#FFFFFF"        // White
};

function PostureMap() {
    const location = useLocation();
    const navigate = useNavigate();
    const { videoId } = location.state || {};

    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const playerRef = useRef(null);
    const cameraRef = useRef(null);
    const isProcessing = useRef(false);

    // --- STATES ---
    const [angle, setAngle] = useState(0);
    const [isPaused, setIsPaused] = useState(true);
    const [isCorrect, setIsCorrect] = useState(true);
    const [history, setHistory] = useState([]);
    const [isCalibrated, setIsCalibrated] = useState(false);
    const [calibrationMsg, setCalibrationMsg] = useState("System Standby. Click video to start session.");

    const lastSnapshotTime = useRef(0);
    const TARGET_ANGLE = 35;

    // Temporal Smoothing: Prevents flickering red signals during fast transitions.
    // Grace period set to 7 frames (~0.25s) for snappy but forgiving response.
    const errorTimers = useRef({ ARMS: 0, MIDDLE: 0, LEGS: 0 });
    const ERROR_GRACE_PERIOD = 7; 

    // 1. Initialize YouTube API
    useEffect(() => {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
            playerRef.current = new window.YT.Player('youtube-player', {
                events: {
                    'onReady': () => console.log("YT Player Ready"),
                }
            });
        };
    }, []);

    const calculateAngle = (a, b, c) => {
        const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
        let angle = Math.abs((radians * 180.0) / Math.PI);
        if (angle > 180.0) angle = 360 - angle;
        return Math.round(angle);
    };

    const toggleSync = () => {
        if (isPaused) {
            playerRef.current?.playVideo();
            setIsPaused(false);
            if (!isCalibrated) {
                setCalibrationMsg("Adjusting Screen: Please show your full torso...");
            }
        } else {
            setIsPaused(true);
            setCalibrationMsg("Session Paused. Click video to resume.");
        }
    };

    const takeSnapshot = (currentAngle, failedParts) => {
        if (isPaused) return;
        const now = Date.now();
        if (now - lastSnapshotTime.current > 5000 && canvasRef.current && playerRef.current?.getCurrentTime) {
            const userImage = canvasRef.current.toDataURL("image/png");
            const videoTime = Math.floor(playerRef.current.getCurrentTime());
            const guideThumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

            const minutes = Math.floor(videoTime / 60);
            const seconds = videoTime % 60;
            const formattedVideoTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            const mistakeLabel = failedParts.length > 0
                ? `Incorrect ${failedParts.join(", ")}`
                : "General Form Deviation";

            setHistory((prev) => [
                ...prev,
                {
                    userImage,
                    guideThumbnail,
                    angle: currentAngle,
                    timestamp: new Date().toLocaleTimeString(),
                    videoTimestamp: videoTime,
                    displayVideoTime: formattedVideoTime,
                    deviation: Math.abs(currentAngle - TARGET_ANGLE),
                    status: currentAngle > (TARGET_ANGLE + 25) ? "Critical" : "Warning",
                    suggestion: "Keep your movements controlled.",
                    mistakeLogic: mistakeLabel
                },
            ]);
            lastSnapshotTime.current = now;
        }
    };

    useEffect(() => {
        if (isPaused) {
            if (cameraRef.current) {
                cameraRef.current.stop();
                cameraRef.current = null;
            }
            return;
        }

        const pose = new Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        pose.onResults((results) => {
            if (isPaused || !results.poseLandmarks || !canvasRef.current) return;

            const canvasCtx = canvasRef.current.getContext("2d");
            const { width, height } = canvasRef.current;

            canvasCtx.save();
            canvasCtx.clearRect(0, 0, width, height);
            canvasCtx.drawImage(results.image, 0, 0, width, height);

            const lm = results.poseLandmarks;

            // --- 1. CALIBRATION LOGIC ---
            const isBodyVisible = lm[11].visibility > 0.7 && lm[12].visibility > 0.7 &&
                                  lm[23].visibility > 0.7 && lm[24].visibility > 0.7;

            if (!isCalibrated) {
                if (isBodyVisible) {
                    setIsCalibrated(true);
                    setCalibrationMsg("✅ Screen Adjusted: Green Signal!");
                } else {
                    setCalibrationMsg("❌ Please step back until your torso is visible.");
                    drawConnectors(canvasCtx, lm, POSE_CONNECTIONS, { color: "#FFCC00", lineWidth: 4 });
                    canvasCtx.restore();
                    return;
                }
            }

            // --- 2. MULTI-PART EVALUATION (REFINED THRESHOLDS) ---
            const currentAngle = calculateAngle(lm[11], lm[13], lm[15]);
            
            const rawStatus = {
                FACE: lm[0].visibility > 0.5,
                ARMS: currentAngle > 50 && currentAngle < 150, 
                MIDDLE: Math.abs(lm[11].x - lm[23].x) < 0.20,
                LEGS: calculateAngle(lm[23], lm[25], lm[27]) > 60
            };

            // --- 3. TEMPORAL GRACE PERIOD (LAG HANDLING) ---
            const status = { ...rawStatus };
            Object.keys(errorTimers.current).forEach(part => {
                if (!rawStatus[part]) {
                    errorTimers.current[part] += 1;
                    if (errorTimers.current[part] < ERROR_GRACE_PERIOD) {
                        status[part] = true; 
                    }
                } else {
                    errorTimers.current[part] = 0; 
                }
            });

            const failedParts = [];
            if (!status.FACE) failedParts.push("Face Visibility");
            if (!status.ARMS) failedParts.push("Arms");
            if (!status.MIDDLE) failedParts.push("Core Alignment");
            if (!status.LEGS) failedParts.push("Legs/Hips");

            const isPostureWrong = failedParts.length > 0;
            setIsCorrect(!isPostureWrong);
            setAngle(currentAngle);

            // --- 4. FACE BLUR LOGIC ---
            const isFaceExercise = false; 
            if (!isFaceExercise) {
                const faceLandmarks = BODY_PARTS.FACE.map(i => lm[i]);
                const xs = faceLandmarks.map(p => p.x * width);
                const ys = faceLandmarks.map(p => p.y * height);
                const minX = Math.min(...xs) - 20, maxX = Math.max(...xs) + 20;
                const minY = Math.min(...ys) - 40, maxY = Math.max(...ys) + 20;

                canvasCtx.save();
                canvasCtx.beginPath();
                canvasCtx.rect(minX, minY, maxX - minX, maxY - minY);
                canvasCtx.clip();
                canvasCtx.filter = "blur(15px)";
                canvasCtx.drawImage(results.image, 0, 0, width, height);
                canvasCtx.restore();
            }

            // --- 5. SEGMENTED DRAWING ---
            POSE_CONNECTIONS.forEach(([start, end]) => {
                let connectionColor = "#FFFFFF33";
                if (BODY_PARTS.FACE.includes(start)) connectionColor = status.FACE ? DEFAULT_COLORS.FACE : "#FF0000";
                else if (BODY_PARTS.ARMS_SHOULDER_NECK.includes(start)) connectionColor = status.ARMS ? DEFAULT_COLORS.ARMS_SHOULDER_NECK : "#FF0000";
                else if (BODY_PARTS.MIDDLE_ABDOMEN.includes(start)) connectionColor = status.MIDDLE ? DEFAULT_COLORS.MIDDLE_ABDOMEN : "#FF0000";
                else if (BODY_PARTS.HIPS_LEGS.includes(start)) connectionColor = status.LEGS ? DEFAULT_COLORS.HIPS_LEGS : "#FF0000";
                
                canvasCtx.beginPath();
                canvasCtx.moveTo(lm[start].x * width, lm[start].y * height);
                canvasCtx.lineTo(lm[end].x * width, lm[end].y * height);
                canvasCtx.strokeStyle = connectionColor;
                canvasCtx.lineWidth = 4;
                canvasCtx.stroke();
            });

            Object.keys(BODY_PARTS).forEach(key => {
                const indices = BODY_PARTS[key];
                const isPartCorrect = (key === 'ARMS_SHOULDER_NECK') ? status.ARMS :
                                     (key === 'MIDDLE_ABDOMEN') ? status.MIDDLE :
                                     (key === 'HIPS_LEGS') ? status.LEGS : status.FACE;
                const color = isPartCorrect ? DEFAULT_COLORS[key] : "#FF0000";
                indices.forEach(index => {
                    const landmark = lm[index];
                    if (landmark.visibility > 0.5) {
                        canvasCtx.beginPath();
                        canvasCtx.arc(landmark.x * width, landmark.y * height, 4, 0, 2 * Math.PI);
                        canvasCtx.fillStyle = color;
                        canvasCtx.fill();
                    }
                });
            });

            if (isPostureWrong) {
                takeSnapshot(currentAngle, failedParts);
            }
            canvasCtx.restore();
        });

        if (webcamRef.current && webcamRef.current.video) {
            cameraRef.current = new cam.Camera(webcamRef.current.video, {
                onFrame: async () => {
                    if (isPaused || isProcessing.current || !webcamRef.current?.video) return;
                    try {
                        isProcessing.current = true;
                        await pose.send({ image: webcamRef.current.video });
                    } catch (error) {
                        console.error("MediaPipe Error:", error);
                    } finally {
                        isProcessing.current = false;
                    }
                },
                width: 640,
                height: 480,
            });
            cameraRef.current.start();
        }

        return () => {
            if (cameraRef.current) cameraRef.current.stop();
        };
    }, [isPaused, isCalibrated]);

    return (
        <div style={{ padding: "0px", backgroundColor: "#f8f9fa", minHeight: "100vh", fontFamily: "Arial" }}>
            {/* STATUS BAR */}
            <div style={{
                ...styles.signalBar,
                backgroundColor: isPaused ? "#6c757d" : (isCalibrated ? "#28a745" : "#ffc107")
            }}>
                {calibrationMsg}
            </div>

            <div style={{ padding: "10px 20px" }}>
                <button onClick={() => navigate("/")} style={styles.backBtn}>← Back</button>
            </div>

            {/* Video Main Grid */}
            <div style={styles.mainGrid}>
                <div style={styles.card}>
                    <h3 style={{ color: "#28a745", paddingLeft: "10px" }}>Guide (Target: ~{TARGET_ANGLE}°)</h3>
                    <div style={styles.videoContainer}>
                        <iframe id="youtube-player" width="100%" height="100%" src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&mute=1&controls=1`} frameBorder="0" style={{ pointerEvents: "auto" }} />
                    </div>
                </div>

                <div style={styles.card}>
                    <h3 style={{ color: isCorrect ? "#28a745" : "#dc3545", paddingLeft: "10px" }}>
                        Your Form ({angle}°) {isPaused ? " - OFFLINE" : ""}
                    </h3>
                    <div style={{ ...styles.videoContainer, cursor: "pointer" }} onClick={toggleSync} >
                        {!isPaused ? (
                            <>
                                <Webcam ref={webcamRef} mirrored={true} style={styles.webcam} />
                                <canvas ref={canvasRef} width={640} height={480} style={styles.canvas} />
                            </>
                        ) : (
                            <div style={styles.overlay}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={styles.playIcon}>▶</div>
                                    <p style={{ marginTop: "10px" }}>{history.length > 0 ? "Resume Session" : "Start Session"}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* SESSION EVALUATION MATRIX */}
            {history.length > 0 && (
                <div style={{ padding: "20px" }}>
                    <div style={{ ...styles.card, padding: "20px" }}>
                        <h2 style={{ borderBottom: "2px solid #333", paddingBottom: "10px" }}>Session Evaluation Matrix</h2>
                        <table style={styles.matrixTable}>
                            <thead>
                                <tr style={{ backgroundColor: "#343a40", color: "#fff" }}>
                                    <th style={styles.th}>Video Time</th>
                                    <th style={styles.th}>Mistake Logic</th>
                                    <th style={styles.th}>Angle</th>
                                    <th style={styles.th}>Severity</th>
                                    <th style={styles.th}>Corrective Suggestion</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((item, idx) => (
                                    <tr key={idx} style={styles.tr}>
                                        <td style={styles.tdBold}>{item.displayVideoTime}</td>
                                        <td style={styles.td}>
                                            <span style={{ color: "#dc3545", fontWeight: "bold" }}>{item.mistakeLogic}</span>
                                        </td>
                                        <td style={styles.td}>{item.angle}°</td>
                                        <td style={{ ...styles.td, fontWeight: 'bold', color: item.status === "Critical" ? "#dc3545" : "#ffc107" }}>{item.status}</td>
                                        <td style={styles.td}>⚠️ {item.suggestion}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* COMPARISON GALLERY */}
            {history.length > 0 && (
                <div style={{ padding: "20px" }}>
                    <div style={{ ...styles.card, marginTop: "10px", padding: "20px" }}>
                        <h3>Comparison Gallery (Click Target to Review Pose)</h3>
                        <div style={styles.comparisonGrid}>
                            {history.map((item, idx) => (
                                <div key={idx} style={styles.comparisonCard}>
                                    <div style={styles.sideBySide}>
                                        <div style={{ ...styles.snapshotBox, cursor: "pointer" }} onClick={() => { playerRef.current?.seekTo(item.videoTimestamp); playerRef.current?.playVideo(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} >
                                            <span style={styles.labelTag}>View Pose at {item.displayVideoTime}</span>
                                            <img src={item.guideThumbnail} alt="guide" style={styles.snapshotImg} />
                                            <div style={styles.seekOverlay}>▶ Jump to Video Time</div>
                                        </div>
                                        <div style={styles.snapshotBox}>
                                            <span style={{ ...styles.labelTag, backgroundColor: "#dc3545" }}>Your Mistake</span>
                                            <img src={item.userImage} alt="user" style={styles.snapshotImg} />
                                        </div>
                                    </div>
                                    <div style={styles.analysisFooter}>
                                        <strong>Logged At:</strong> {item.timestamp} | <strong> Video Time:</strong> {item.displayVideoTime} | <strong> Deviation:</strong> <span style={{ color: "red" }}>+{item.deviation}°</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    signalBar: { padding: "10px", color: "white", textAlign: "center", fontWeight: "bold", transition: "0.3s ease", fontSize: "14px" },
    mainGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px", padding: "0 10px" },
    card: { background: "#fff", borderRadius: "8px", boxShadow: "0 4px 10px rgba(0,0,0,0.06)", overflow: "hidden" },
    videoContainer: { position: "relative", backgroundColor: "#000", height: "65vh" },
    webcam: { width: "100%", height: "100%", objectFit: "cover" },
    canvas: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", transform: "scaleX(-1)" },
    overlay: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", color: "#fff", background: "rgba(0,0,0,0.5)" },
    playIcon: { fontSize: "60px", background: "rgba(40, 167, 69, 0.8)", width: "80px", height: "80px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", margin: "0 auto" },
    backBtn: { padding: "8px 16px", cursor: "pointer", border: "none", borderRadius: "4px", background: "#333", color: "#fff" },
    comparisonGrid: { display: "flex", flexDirection: "column", gap: "15px", marginTop: "15px" },
    comparisonCard: { background: "#fff", border: "1px solid #ddd", borderRadius: "8px", padding: "10px" },
    sideBySide: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
    snapshotBox: { position: "relative", overflow: "hidden", borderRadius: "6px" },
    snapshotImg: { width: "100%", display: "block", border: "1px solid #eee" },
    labelTag: { position: "absolute", top: "5px", left: "5px", backgroundColor: "#28a745", color: "#fff", padding: "3px 6px", borderRadius: "3px", fontSize: "9px", fontWeight: "bold", zIndex: 2 },
    seekOverlay: { position: "absolute", bottom: 0, width: "100%", background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: "10px", textAlign: "center", padding: "4px 0" },
    analysisFooter: { marginTop: "8px", paddingTop: "8px", borderTop: "1px dashed #ccc", fontSize: "12px", textAlign: "center" },
    matrixTable: { width: "100%", borderCollapse: "collapse", marginTop: "20px" },
    th: { padding: "12px", textAlign: "left", fontSize: "14px" },
    td: { padding: "12px", borderBottom: "1px solid #dee2e6", fontSize: "13px" },
    tdBold: { padding: "12px", borderBottom: "1px solid #dee2e6", fontSize: "13px", fontWeight: 'bold' },
    tr: { transition: "background 0.2s" }
};

export default PostureMap;