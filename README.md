Architecture
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │   FastAPI       │    │   AI Services   │
│   (TypeScript)  │◄──►│   Backend       │◄──►│   OpenAI/Gemini │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │   YouTube API   │    │   Redis Cache   │
│   Database      │◄──►│   Integration   │◄──►│   (Optional)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
Quick Start

Prerequisites
Python 3.10+
Node.js 16+
PostgreSQL 13+

API Keys: OpenAI, Google Gemini

1. Clone & Setup
# Clone repository
git clone https://github.com/yourusername/fitness-chatbot.git
cd fitness-chatbot
# Setup backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

2. Configure Environment
# Backend configuration
cd backend
cp .env.example .env
# Edit .env with your API keys

3. Run the Application
# Terminal 1: Start backend
cd backend
uvicorn app.main:app --reload --port 8000

# Terminal 2: Start frontend
cd frontend
npm start

4. Access the Application
Frontend: http://localhost:3000
Backend API: http://localhost:8000
API Documentation: http://localhost:8000/docs

📁 Project Structure

fitness-chatbot/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── api/              # API endpoints and integrations
│   │   │   ├── ai_providers.py  # OpenAI/Gemini integration
│   │   │   └── youtube_api.py   # YouTube video search
│   │   ├── models.py         # SQLAlchemy models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── database.py       # Database configuration
│   │   └── main.py           # FastAPI application
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Environment template
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API service layer
│   │   ├── App.jsx           # Main application
│   │   └── index.js          # Entry point
│   └── package.json          # Node.js dependencies
└── docker-compose.yml        # Docker orchestration

Environment Variables
Create .env file in backend/
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
# Setup frontend
cd ../frontend
npm install
