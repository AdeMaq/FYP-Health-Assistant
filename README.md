**fitness-agent-python**
  A versatile conversational AI agent designed to assist users with fitness, nutrition, and general well-being queries. This agent leverages various services for language processing, data retrieval, and memory management to provide personalized and actionable advice.

**Features**
**Conversational AI:**
Utilizes Google Gemini services for sophisticated natural language understanding and generation.
**Nutrition Service:**
Integrates with external APIs (like Edamam and Spoonacular) to retrieve detailed nutrition and recipe information.
**Fitness Service:**
Likely includes logic or integrations for fitness-related advice and tracking (though the specific service name flm_service might be custom or stand for something else).
**Persistent Memory:** 
Employs a database (db_memory.py, memory.db) to maintain conversation history and user-specific information.
**Frontend:** A simple web interface (index.html) for interacting with the agent.
**Project Structure:**
The project follows a modular structure, separating core logic, services, and the user interface.
fitness-agent-python/
├── .env                  # Environment variables for API keys and configuration
├── .venv                 # Python virtual environment (ignored by Git)
├── app/                  # The core application logic and services
│   ├── __pycache__
│   ├── agent.py          # The central orchestrator/brain of the agent
│   ├── db_memory.py      # Database initialization and interface
│   ├── gemini_service.py # Handler for interactions with the Gemini API
│   ├── flm_service.py    # Fitness/Service Logic (e.g., calculations, advice logic)
│   ├── main.py           # Application entry point/API server (e.g., using FastAPI/Flask)
│   ├── memory.db         # SQLite database file for conversation memory
│   ├── models.py         # Data models/schemas (e.g., Pydantic models)
│   ├── nlp.py            # Natural Language Processing utilities
│   ├── nutrition_service.py # Handler for nutrition-related API calls
│   └── youtube_service.py # Handler for YouTube API calls
├── frontend/             # Static files for the web interface
│   └── index.html        # Main HTML file for the chat interface
├── README.md             # This file
└── requirements.txt      # List of required Python packages
**Getting Started**:  Follow these steps to set up and run the project locally.
**1. Prerequisites:**
     Python 3.8+
     A Google AI API Key (for Gemini)
     API Keys for the following services (as indicated in your .env):
        Spoonacular API
        Gemini API
        OpenAI API
**2. SetupClone the repository (if applicable):**
  git clone <your-repo-link>
  cd fitness-agent-python
**Create a virtual environment:**
  python -m venv .venv
  source .venv/bin/activate  # On Windows: .venv\Scripts\activate
  Install dependencies: pip install -r requirements.txt

