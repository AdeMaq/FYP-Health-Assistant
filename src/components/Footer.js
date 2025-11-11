import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const Footer = () => {
    return (
        <footer
            style={{
                backgroundColor: "#0d0b11",
                color: "#ccc",
                padding: "60px 0 20px 0",
                borderTop: "1px solid rgba(255,255,255,0.05)",
            }}
        >
            <Container>
                <Row
                    className="gy-4"
                    style={{
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                        paddingBottom: "40px",
                    }}
                >
                    {/* Brand Section */}
                    <Col md={3} sm={12}>
                        <div
                            className="d-flex align-items-center gap-2"
                            style={{ marginBottom: "15px" }}
                        >
                            <i
                                className="bi bi-dumbbell"
                                style={{ fontSize: "26px", color: "#a855f7" }}
                            ></i>
                            <h5
                                style={{
                                    fontWeight: "bold",
                                    fontSize: "20px",
                                    background: "linear-gradient(90deg, #7e3ae4, #b46cff)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    margin: 0,
                                }}
                            >
                                FitBot AI
                            </h5>
                        </div>
                        <p style={{ fontSize: "14px", color: "#b1b1b1", lineHeight: "1.6" }}>
                            Your personal AI-powered fitness companion for achieving your
                            health goals.
                        </p>
                    </Col>

                    {/* Quick Links */}
                    <Col md={3} sm={6}>
                        <h6
                            style={{
                                color: "#a855f7",
                                fontWeight: "bold",
                                marginBottom: "15px",
                            }}
                        >
                            Quick Links
                        </h6>
                        <ul
                            className="list-unstyled"
                            style={{ lineHeight: "1.9", fontSize: "14px" }}
                        >
                            <li>
                                <a
                                    href="#home"
                                    style={{
                                        color: "#ccc",
                                        textDecoration: "none",
                                        transition: "color 0.3s",
                                    }}
                                    onMouseEnter={(e) => (e.target.style.color = "#a855f7")}
                                    onMouseLeave={(e) => (e.target.style.color = "#ccc")}
                                >
                                    Home
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#chatbot"
                                    style={{
                                        color: "#ccc",
                                        textDecoration: "none",
                                        transition: "color 0.3s",
                                    }}
                                    onMouseEnter={(e) => (e.target.style.color = "#a855f7")}
                                    onMouseLeave={(e) => (e.target.style.color = "#ccc")}
                                >
                                    AI Assistant
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#bmi"
                                    style={{
                                        color: "#ccc",
                                        textDecoration: "none",
                                        transition: "color 0.3s",
                                    }}
                                    onMouseEnter={(e) => (e.target.style.color = "#a855f7")}
                                    onMouseLeave={(e) => (e.target.style.color = "#ccc")}
                                >
                                    BMI Calculator
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#about"
                                    style={{
                                        color: "#ccc",
                                        textDecoration: "none",
                                        transition: "color 0.3s",
                                    }}
                                    onMouseEnter={(e) => (e.target.style.color = "#a855f7")}
                                    onMouseLeave={(e) => (e.target.style.color = "#ccc")}
                                >
                                    About Us
                                </a>
                            </li>
                        </ul>
                    </Col>

                    {/* Services */}
                    <Col md={3} sm={6}>
                        <h6
                            style={{
                                color: "#a855f7",
                                fontWeight: "bold",
                                marginBottom: "15px",
                            }}
                        >
                            Services
                        </h6>
                        <ul
                            className="list-unstyled"
                            style={{ lineHeight: "1.9", fontSize: "14px", color: "#b1b1b1" }}
                        >
                            <li>Workout Plans</li>
                            <li>Diet Planning</li>
                            <li>Exercise Recommendations</li>
                            <li>Health Tips</li>
                        </ul>
                    </Col>

                    {/* Contact */}
                    <Col md={3} sm={12}>
                        <h6
                            style={{
                                color: "#a855f7",
                                fontWeight: "bold",
                                marginBottom: "15px",
                            }}
                        >
                            Contact
                        </h6>
                        <ul
                            className="list-unstyled"
                            style={{ lineHeight: "1.9", fontSize: "14px", color: "#b1b1b1" }}
                        >
                            <li className="d-flex align-items-center gap-2">
                                <i className="bi bi-envelope-fill" style={{ color: "#a855f7" }}></i>
                                <a
                                    href="mailto:support@fitbot.ai"
                                    style={{
                                        color: "#ccc",
                                        textDecoration: "none",
                                        transition: "color 0.3s",
                                    }}
                                    onMouseEnter={(e) => (e.target.style.color = "#a855f7")}
                                    onMouseLeave={(e) => (e.target.style.color = "#ccc")}
                                >
                                    support@fitbot.ai
                                </a>
                            </li>
                            <li className="d-flex align-items-center gap-2">
                                <i className="bi bi-telephone-fill" style={{ color: "#a855f7" }}></i>
                                +1 (555) 123-4567
                            </li>
                            <li className="d-flex align-items-center gap-2">
                                <i className="bi bi-geo-alt-fill" style={{ color: "#a855f7" }}></i>
                                123 Fitness St, Health City
                            </li>
                        </ul>
                    </Col>
                </Row>

                {/* Bottom Bar */}
                <Row className="pt-4">
                    <Col className="text-center">
                        <p
                            style={{
                                fontSize: "13px",
                                color: "#999",
                                marginTop: "15px",
                            }}
                        >
                            © 2025 FitBot AI. All rights reserved. | Final Year Project
                        </p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;
