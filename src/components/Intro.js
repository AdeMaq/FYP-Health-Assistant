import React from "react";
import { Button, Container, Row, Col, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import hero from "../assests/fitness-hero.jpg";

const Intro = () => {
  const sectionStyle = {
    backgroundImage: `url(${hero})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    color: "white",
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    overflow: "hidden",
    marginTop:"50px"
  };

  const overlayStyle = {
    position: "absolute",
    inset: "0",
    background:
      "linear-gradient(to bottom, rgba(6, 6, 7, 0.9), rgba(4, 3, 5, 0.85), rgba(11, 11, 12, 0.9))",
    zIndex: 1,
  };

  const contentStyle = {
    position: "relative",
    zIndex: 2,
    maxWidth: "900px",
    padding: "0 20px",
  };

  return (
    <section id="home" style={sectionStyle}>
      <div style={overlayStyle}></div>
      <Container style={contentStyle}>
        {/* --- Headings --- */}
        <h1
          style={{
            fontSize: "70px",
            fontWeight: "700",
            lineHeight: "1.2",
          }}
        >
          Your Personal{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #7e3ae4, #b46cff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "inline-block",
            }}
          >
            AI Fitness
          </span>
          <br />
          Coach
        </h1>

        <p
          style={{
            fontSize: "22px",
            color: "rgba(220,220,220,0.85)",
            maxWidth: "700px",
            margin: "25px auto 40px",
          }}
        >
          Get personalized workout plans, diet recommendations, and expert
          fitness guidance powered by AI
        </p>

        {/* --- Buttons --- */}
        <div className="d-flex flex-column flex-sm-row justify-content-center align-items-center gap-4">
          <Button
            size="lg"
            style={{
              backgroundColor: "#7b5dfb",
              border: "none",
              fontSize: "18px",
              fontWeight: "600",
              padding: "14px 38px",
              borderRadius: "14px",
              boxShadow: "0 0 15px rgba(123,93,251,0.5)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
            onClick={() =>
              document
                .getElementById("chatbot")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            💬 Start Chat
          </Button>

          <Button
            size="lg"
            style={{
              backgroundColor: "transparent",
              border: "2px solid #b46cff",
              color: "#b46cff",
              fontSize: "18px",
              fontWeight: "600",
              padding: "14px 38px",
              borderRadius: "14px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#b46cff";
              e.currentTarget.style.color = "white";
              e.currentTarget.style.boxShadow =
                "0 0 20px rgba(180,108,255,0.6)";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#b46cff";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "scale(1)";
            }}
            onClick={() =>
              document
                .getElementById("bmi")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            📟 Calculate BMI
          </Button>
        </div>

        {/* --- Feature Cards --- */}
        <Row className="justify-content-center mt-5">
          {[
            {
              icon: "🏋️",
              title: "Workout Plans",
              text: "Customized exercise routines for your goals",
            },
            {
              icon: "🥗",
              title: "Diet Planning",
              text: "Nutritious meal plans tailored to you",
            },
            {
              icon: "📊",
              title: "BMI Tracking",
              text: "Monitor your fitness progress easily",
            },
          ].map((item, index) => (
            <Col key={index} md={4} sm={6} xs={10} className="mb-4">
              <Card
                style={{
                  background: "rgba(40, 20, 70, 0.5)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "18px",
                  padding: "30px 20px",
                  color: "white",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  boxShadow: "0 0 15px rgba(0,0,0,0.25)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow =
                    "0 0 30px rgba(123,93,251,0.6)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 0 15px rgba(0,0,0,0.25)";
                }}
              >
                <Card.Title
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "#b77bff",
                    marginBottom: "10px",
                  }}
                >
                  {item.icon} {item.title}
                </Card.Title>
                <Card.Text
                  style={{
                    fontSize: "17px",
                    color: "rgba(220,220,220,0.8)",
                  }}
                >
                  {item.text}
                </Card.Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default Intro;
