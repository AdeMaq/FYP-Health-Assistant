# FYP-Health-Assistant
# 🧠 Smart Video Recommendation API (Server)

This is the backend for the FYP Video Recommendation System. It is built with **Node.js**, **Express**, and **PostgreSQL** (via TypeORM). It features a hybrid search engine that utilizes a local database, the Google YouTube Data API, and a fallback scraper to fetch fitness content. It also includes a self-learning NLP layer using the Datamuse API.

## 🛠 Tech Stack
- **Runtime:** Node.js & Express.js
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **External APIs:** Google YouTube Data API v3, Datamuse (Synonyms)
- **Scraper:** youtube-sr

## ⚙️ Prerequisites
Before running the server, ensure you have:
1.  **Node.js** (v14+) installed.
2.  **PostgreSQL** installed and running.
3.  A **Google Cloud API Key** with YouTube Data API v3 enabled.

## 🚀 Installation & Setup

1.  **Clone the repository** (if not already done) and navigate to the server folder:
    ```bash
    cd server
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the root of the `server` directory and configure the following variables:

    ```env
    PORT=5000
    
    # Database Configuration
    DB_HOST=localhost
    DB_PORT=5432
    DB_USERNAME=postgres
    DB_PASSWORD=your_password
    DB_NAME=fyp_fitness_db

    # External APIs
    GOOGLE_API_KEY=your_google_api_key_here
    ```

4.  **Run the Server:**
    ```bash
    # Standard start
    node src/server.js

    # Or if you have nodemon installed (for development)
    npm run dev
    ```

    *On the first run, TypeORM will automatically generate the tables (`videos`, `synonyms`, `stop_words`) in your PostgreSQL database.*

## 📡 API Endpoints

### 💬 Chat & Recommendation
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/videos/chat` | Accepts a natural language prompt and returns video recommendations. |

### 🛠 Management (CRUD)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/videos` | Get all stored videos. |
| `POST` | `/api/videos` | Add a new video manually. |
| `PUT` | `/api/videos/:id` | Update an existing video. |
| `DELETE` | `/api/videos/:id` | Delete a video. |
| `POST` | `/api/videos/seed` | Seed the DB with `videos.json`. |

### 🧠 Logic & NLP
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/videos/tags` | Get all synonyms and stop words. |
| `POST` | `/api/videos/tags/synonym` | Add/Edit a keyword synonym mapping. |
| `POST` | `/api/videos/tags/stopword` | Add a word to the ignore list. |

## 📂 Project Structure
- `controllers/`: Handles incoming HTTP requests.
- `services/`: Contains the core business logic (NLP parsing, Search algorithms).
- `entities/`: TypeORM database models.
- `routes/`: API route definitions.

# 🏋️ Smart Video Recommendation Client

This is the frontend interface for the FYP Fitness Recommendation System. Built with **React.js**, it provides a user-friendly chat interface for finding workouts and an admin dashboard for managing the system's learning logic.

## 💻 Tech Stack
- **Framework:** React.js
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **Styling:** CSS / Inline Styles

## 🚀 Installation & Setup

1.  **Navigate to the client folder:**
    ```bash
    cd client
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Run the Application:**
    ```bash
    npm start
    ```
    The app will launch at `http://localhost:3000`.

## 🧭 Navigation & Features

### 1. 🤖 Chatbot Interface (`/`)
- **Natural Language Input:** Type requests like "I want a HIIT workout for abs".
- **Visual Results:** Videos are displayed in cards with tags explaining why they were chosen.
- **Direct Links:** Click "Watch Video" to open YouTube directly.

### 2. 📹 Manage Videos (`/manage`)
- **CRUD Operations:** Manually Add, Edit, or Delete videos from the local database.
- **Seed Data:** Button to push the default `json` data to the database.

### 3. 🧠 Manage Logic (`/tags`)
- **Synonym Map:** View the system's "Brain".
    - **Red Rows:** Indicate new words the AI learned automatically from user chats. You can verify or delete these.
- **Stop Words:** Add words (like "please", "want", "need") that the AI should ignore to improve search accuracy.

## 🔧 Configuration
The application is currently configured to talk to the backend at:
`http://localhost:5000`

If your server runs on a different port, please update the Axios calls in:
- `src/components/Workout.js`
- `src/components/VideoForm.js`
- `src/components/TagsManagement.js`

## 📸 Screenshots
*(You can add screenshots of your UI here for your final report)*
