import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Card, Nav } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const BMICalculator = () => {
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [bmi, setBmi] = useState(null);
    const [category, setCategory] = useState("");
    const [activeTab, setActiveTab] = useState("manual");

    const calculateBMI = () => {
        const h = parseFloat(height) / 100;
        const w = parseFloat(weight);

        if (h > 0 && w > 0) {
            const bmiValue = w / (h * h);
            setBmi(parseFloat(bmiValue.toFixed(1)));

            if (bmiValue < 18.5) setCategory("Underweight");
            else if (bmiValue < 25) setCategory("Normal weight");
            else if (bmiValue < 30) setCategory("Overweight");
            else setCategory("Obese");
        }
    };

    const getBMIColor = () => {
        if (!bmi) return "#aaa";
        if (bmi < 18.5) return "#3aa0ff";
        if (bmi < 25) return "#4CAF50";
        if (bmi < 30) return "#ffcc00";
        return "#ff4c4c";
    };

    return (
        <section
            id="bmi"
            style={{
                backgroundColor: "#0c0814",
                color: "white",
                minHeight: "100vh",
                paddingTop: "80px",
            }}
        >
            <Container style={{ maxWidth: "850px" }}>
                <div className="text-center mb-5">
                    <h2
                        style={{
                            fontSize: "48px",
                            fontWeight: "700",
                            color: "white",
                        }}
                    >
                        BMI{" "}
                        <span
                            style={{
                                background: "linear-gradient(45deg, #7e3ae4, #b46cff)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            Calculator
                        </span>
                    </h2>
                    <p style={{
                        fontSize: "18px",
                        color: "rgba(220,220,220,0.85)",
                        maxWidth: "800px",
                        margin: "25px auto 40px",
                    }}>
                        Calculate your Body Mass Index manually or upload a photo for AI analysis
                    </p>
                </div>
                <Card
                    style={{
                        backgroundColor: "#120d1f",
                        border: "1px solid #292238",
                        borderRadius: "10px",
                        padding: "25px",
                        boxShadow: "0 0 20px rgba(99, 99, 99, 0.1)",
                    }}
                >
                    <Nav
                        variant="tabs"
                        className="mb-4"
                        style={{
                            display: "grid",
                            backgroundColor:"#434343ff",
                            gridTemplateColumns: "1fr 1fr", 
                            textAlign: "center",
                            border: "3px solid #434343ff",
                            borderRadius:"20px",
                        }}
                    >
                        <Nav.Item style={{ width: "100%" }}>
                            <Nav.Link
                                eventKey="manual"
                                active={activeTab === "manual"}
                                onClick={() => setActiveTab("manual")}
                                style={{
                                    backgroundColor: activeTab === "manual" ? "#080708ff" : "#434343ff",
                                    color: activeTab === "manual" ? "#b77bff" : "#a3a1b0",
                                    borderRadius: "20px",
                                    fontWeight: "600",
                                    padding: "12px",
                                    fontSize: "15px",
                                    transition: "0.3s",
                                    width: "100%",
                                }}
                            >
                                📟 Manual Input
                            </Nav.Link>
                        </Nav.Item>

                        <Nav.Item style={{ width: "100%" }}>
                            <Nav.Link
                                eventKey="image"
                                active={activeTab === "image"}
                                onClick={() => setActiveTab("image")}
                                style={{
                                    backgroundColor: activeTab === "image" ? "#080708ff" : "#434343ff",
                                    color: activeTab === "image" ? "#b77bff" : "#a3a1b0",
                                    borderRadius: "20px",
                                    fontWeight: "600",
                                    padding: "12px",
                                    fontSize: "15px",
                                    transition: "0.3s",
                                    width: "100%",
                                }}
                            >
                                📤 Image Analysis
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                    {activeTab === "manual" && (
                        <>
                            <Row className="mb-4">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label style={{ fontWeight: "600", color: "white", fontSize: "13px" }}>Height (cm)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="170"
                                            value={height}
                                            onChange={(e) => setHeight(e.target.value)}
                                            style={{
                                                backgroundColor: "#1b122b",
                                                border: "1px solid #2e2440",
                                                color: "#dddddeff",
                                                borderRadius: "12px",
                                                padding: "10px",
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label style={{ fontWeight: "600", color: "white", fontSize: "13px" }}>Weight (kg)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="70"
                                            value={weight}
                                            onChange={(e) => setWeight(e.target.value)}
                                            style={{
                                                backgroundColor: "#1b122b",
                                                border: "1px solid #2e2440",
                                                color: "#cfc9da",
                                                borderRadius: "12px",
                                                padding: "10px",
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Button
                                onClick={calculateBMI}
                                className="w-100"
                                style={{
                                    backgroundColor: "#8b5cf6",
                                    border: "none",
                                    fontWeight: "600",
                                    padding: "5px",
                                    borderRadius: "14px",
                                    fontSize: "18px",
                                    boxShadow: "0 0 15px rgba(139, 92, 246, 0.4)",
                                    transition: "all 0.3s ease",
                                }}
                                onMouseEnter={(e) => (e.target.style.transform = "scale(1.03)")}
                                onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                            >
                                Calculate BMI
                            </Button>

                            {bmi !== null && (
                                <div
                                    style={{
                                        backgroundColor: "#1b122b",
                                        borderRadius: "16px",
                                        border: "1px solid #2e2440",
                                        padding: "5px",
                                        marginTop: "20px",
                                        textAlign: "center",
                                    }}
                                >
                                    <p style={{ color: "#a3a1b0", marginBottom: "5px" }}>Your BMI</p>
                                    <h2 style={{ fontSize: "42px", fontWeight: "700", color: getBMIColor() }}>
                                        {bmi}
                                    </h2>
                                    <p style={{ color: "#b0acbc", fontSize: "15px", fontWeight: "600" }}>
                                        {category}
                                    </p>
                                    <div
                                        style={{
                                            fontSize: "13px",
                                            color: "#a3a1b0",
                                        }}
                                    >
                                        <p>BMI Categories:</p>
                                        <p style={{ color: "#3aa0ff" }}>Underweight: &lt; 18.5</p>
                                        <p style={{ color: "#4CAF50" }}>Normal: 18.5 - 24.9</p>
                                        <p style={{ color: "#ffcc00" }}>Overweight: 25 - 29.9</p>
                                        <p style={{ color: "#ff4c4c" }}>Obese: ≥ 30</p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    {activeTab === "image" && (
                        <div
                            style={{
                                border: "2px dashed #3b2f56",
                                borderRadius: "16px",
                                padding: "40px",
                                textAlign: "center",
                                color: "#cfc9da",
                            }}
                        >
                            <div style={{ fontSize: "48px", marginBottom: "10px" }}>📸</div>
                            <p style={{ fontSize: "18px", marginBottom: "5px" }}>
                                Upload your photo for AI analysis
                            </p>
                            <p style={{ color: "#9b96a8", fontSize: "14px", marginBottom: "20px" }}>
                                Our AI will analyze your body composition and provide a BMI estimate
                            </p>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                style={{
                                    maxWidth: "300px",
                                    margin: "0 auto",
                                    backgroundColor: "transparent",
                                    border: "1px solid #3b2f56",
                                    color: "#cfc9da",
                                    cursor: "pointer",
                                }}
                            />
                            <p style={{ color: "#8a869a", fontSize: "12px", marginTop: "15px" }}>
                                * This feature requires AI integration for production use
                            </p>
                        </div>
                    )}
                </Card>
            </Container>
        </section>
    );
};

export default BMICalculator;
