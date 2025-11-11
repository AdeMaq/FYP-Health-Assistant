import React, { useState } from "react";
import { Card, InputGroup, Form, Button } from "react-bootstrap";
import { SendFill, Robot, PersonFill } from "react-bootstrap-icons";
import "./ChatBot.css";

const ChatBot = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello! I'm your AI Fitness Assistant. I can help you with workout plans, diet recommendations, exercise tips, and answer any fitness-related questions. How can I assist you today?",
            sender: "bot",
        },
    ]);
    const [input, setInput] = useState("");

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage = {
            id: messages.length + 1,
            text: input,
            sender: "user",
        };
        setMessages([...messages, userMessage]);
        setInput("");
        setTimeout(() => {
            const botMessage = {
                id: messages.length + 2,
                text: "I'm here to help with your fitness journey! This is a demo response. In production, I would provide personalized advice based on your query.",
                sender: "bot",
            };
            setMessages((prev) => [...prev, botMessage]);
        }, 1000);
    };

    return (
        <section
            style={{
                paddingTop:"60px",
                backgroundColor: "#0e0413ff",
                color: "#fff",
                minHeight: "100vh",
            }}
        >
            <div className="container text-center mb-5">
                <h1
                    style={{
                        fontWeight: 700,
                        fontSize: "3.5rem",
                    }}
                >
                    AI{" "}
                    <span
                        style={{
                            background: "linear-gradient(45deg, #7e3ae4, #b46cff)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Fitness Assistant
                    </span>
                </h1>
                <p style={{
                    fontSize: "18px",
                    color: "rgba(220,220,220,0.85)",
                    maxWidth: "800px",
                    margin: "25px auto 40px", }}>
                    Get instant answers to your fitness questions, personalized workout
                    plans, and nutrition advice.
                </p>
            </div>

            <div className="d-flex justify-content-center">
                <Card
                    className="chat-card shadow-lg"
                    style={{
                        backgroundColor: "#0d0616",
                        color: "#fff",
                        borderRadius: "20px",
                        width: "100%",
                        maxWidth: "850px",
                        border: "1px solid #2c1a4b",
                    }}
                >
                    <Card.Body style={{ height: "500px", overflowY: "auto", padding: "20px" }}>
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`d-flex mb-3 ${msg.sender === "user" ? "justify-content-end" : "justify-content-start"
                                    }`}
                            >
                                {msg.sender === "bot" && (
                                    <div
                                        className="icon-circle me-2"
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                            borderRadius: "50%",
                                            backgroundColor: "rgba(126, 58, 228, 0.2)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Robot color="#a975ff" size={20} />
                                    </div>
                                )}

                                <div
                                    className="p-3 rounded-4"
                                    style={{
                                        backgroundColor:
                                            msg.sender === "user" ? "#7e3ae4" : "rgba(60, 40, 80, 0.9)",
                                        color: "#fff",
                                        maxWidth: "70%",
                                    }}
                                >
                                    {msg.text}
                                </div>

                                {msg.sender === "user" && (
                                    <div
                                        className="icon-circle ms-2"
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                            borderRadius: "50%",
                                            backgroundColor: "rgba(180, 108, 255, 0.2)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <PersonFill color="#b46cff" size={20} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </Card.Body>

                    <Card.Footer
                        className="p-3"
                        style={{
                            backgroundColor: "#12091f",
                            borderTop: "1px solid #2c1a4b",
                            borderRadius: "0 0 20px 20px",
                        }}
                    >
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="Ask about workouts, diet, exercises..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                                style={{
                                    backgroundColor: "#1a1027",
                                    color: "#fff",
                                    border: "1px solid #2c1a4b",
                                    borderRadius: "12px",
                                }}
                            />
                            <Button
                                onClick={handleSend}
                                style={{
                                    backgroundColor: "#7e3ae4",
                                    border: "none",
                                    borderRadius: "12px",
                                    marginLeft: "8px",
                                    padding: "10px 18px",
                                }}
                            >
                                <SendFill size={18} />
                            </Button>
                        </InputGroup>
                    </Card.Footer>
                </Card>
            </div>
        </section>
    );
};

export default ChatBot;
