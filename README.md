Fitness Chatbot Application

An AI-powered fitness chatbot built with React, FastAPI, and AI services (OpenAI / Google Gemini).
The application provides intelligent fitness guidance, integrates YouTube workout content, and supports scalable backend architecture.
Architecture Overview
<img width="700" height="322" alt="image" src="https://github.com/user-attachments/assets/e36c443d-79ea-49b9-87a0-d34f9d4ce51f" />
Quick Start
Prerequisites

Make sure the following are installed on your system:

Python 3.10+

Node.js 16+

PostgreSQL 13+

API Keys

OpenAI

Google Gemini

YouTube Data API
Installation & Setup
1️⃣ Clone the Repository
Backend Setup (FastAPI)
cd backend
python -m venv venv
Activate virtual environment:
Linux / macOS
source venv/bin/activate
Windows
venv\Scripts\activate
git clone https://github.com/yourusername/fitness-chatbot.git
cd fitness-chatbot
Install dependencies:

pip install -r requirements.txt
Configure Environment Variables
cd backend
cp .env.example .env


Edit .env and add your credentials:

# API Keys
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
YOUTUBE_API_KEY=your_youtube_api_key
GOOGLE_API_KEY=your_google_api_key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/fitness_chatbot

# Application Settings
SECRET_KEY=your_secret_key_here
ENVIRONMENT=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000

4️⃣ Run the Application
Start Backend (Terminal 1)
cd backend
uvicorn app.main:app --reload --port 8000

Start Frontend (Terminal 2)
cd frontend
npm install
npm start

🌐 Access the Application

Frontend: http://localhost:3000

Backend API: http://localhost:8000

API Documentation (Swagger): http://localhost:8000/docs

📁 Project Structure
<img width="589" height="661" alt="image" src="https://github.com/user-attachments/assets/d3afa029-2afe-47b1-ae5d-59335b1b455b" />
