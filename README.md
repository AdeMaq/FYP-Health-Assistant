# 🤖 fitness-agent-python

A versatile conversational AI agent designed to assist users with fitness, nutrition, and general well-being queries. This agent leverages various services for language processing, data retrieval, and memory management to provide personalized and actionable advice.

## ✨ Features

* **Conversational AI:** Utilizes Google Gemini services for sophisticated natural language understanding and generation.
* **Nutrition Service:** Integrates with external APIs (like Edamam and Spoonacular) to retrieve detailed nutrition and recipe information.
* **Fitness Service:** Includes custom logic or integrations for fitness-related advice and tracking (`flm_service`).
* **Video Integration:** Uses the YouTube API to find and summarize relevant instructional or informational videos.
* **Persistent Memory:** Employs a database (`db_memory.py`, `memory.db`) to maintain conversation history and user-specific information.
* **Frontend:** A simple web interface (`index.html`) for interacting with the agent.

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### 1. Prerequisites

* Python 3.8+
* A Google AI API Key (for Gemini)
* API Keys for the following services (as indicated in your `.env`):
    * Gemini API
    * OpenAI API
    * Spoonacular API

### 2. Setup

1.  **Clone the repository (if applicable):**
   
    git clone <your-repo-link>
    cd fitness-agent-python
    

2.  **Create a virtual environment:**
    
    python -m venv .venv
    source .venv/bin/activate  # On Windows: .venv\Scripts\activate
    
3.  **Install dependencies:**
    
    pip install -r requirements.txt
    

4.  **Configure Environment Variables:**

    Create a file named `.env` in the root directory and populate it with your necessary API keys and configuration.

    ```env
    # .env example
  
    # --- App settings ---
    HOST=0.0.0.0
    PORT=8000
    ```

### 3. Running the Application

Execute the main application file:
uvicorn app.main:app --reload

