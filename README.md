# FYP-Health-Assistant
Here is the complete, properly formatted `README.md` file for your GitHub repository. You can copy and paste this directly into your project.

```markdown
# 🏋️ Fitness AI Chatbot

A smart, full-stack fitness video recommendation system built with the **PERN stack** (PostgreSQL, Express, React, Node.js) and **TypeORM**. This application utilizes Natural Language Processing (NLP) to understand user workout requests, fetches relevant content from a local database or YouTube, and "learns" new fitness terminology in real-time.

## 🚀 Key Features

* **Intelligent Chat Interface:** Ask for workouts in plain English (e.g., "I want to lose belly fat" or "10 min HIIT").
* **NLP & Synonym Learning:**
    * Automatically filters "Stop Words" to focus on core intent.
    * Uses a **Fitness Dictionary API** (Datamuse) to learn synonyms for unknown words and stores them to improve future search accuracy.
* **Hybrid Search Strategy:**
    * **Layer 1:** Scans the local PostgreSQL database for high-scoring matches.
    * **Layer 2:** Falls back to the official YouTube v3 API if local results are insufficient.
    * **Layer 3:** Uses a secondary scraper for redundancy.
* **Automated Discovery & Maintenance:**
    * **Cron Jobs:** Background tasks that discover and seed new fitness videos daily.
    * **Database Cleanup:** Automatically detects and removes "dead" or deleted YouTube videos from your library.
* **Integrated Video Player:** Watch recommended videos directly inside the application using an embedded YouTube player.

---

## 🛠️ Tech Stack

* **Frontend:** React.js, React Router DOM, Axios
* **Backend:** Node.js, Express, TypeORM, Node-Cron
* **Database:** PostgreSQL
* **External APIs:** YouTube Data API v3, Datamuse API

---

## 📋 Prerequisites

* **Node.js** (v16 or higher)
* **PostgreSQL** installed and running.
* **YouTube API Key:** Obtain one from the [Google Cloud Console](https://console.cloud.google.com/).

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone [https://github.com/AdeMaq/fitness-ai-chatbot.git](https://github.com/AdeMaq/fitness-ai-chatbot.git)
cd fitness-ai-chatbot

```

### 2. Manual Database Creation

Before starting the backend, you must manually create your database:

1. Open **pgAdmin** or your terminal.
2. Execute the following command:
```sql
CREATE DATABASE fitness_db;

```
3. or create it manually



### 3. Backend Setup & Migrations

1. Navigate to the server directory:
```bash
cd server
//if migrations already run
npm run dev

```


2. Install dependencies:
```bash
npm install

```


3. Create a `.env` file in the `server` folder:
```env
PORT=5000
GOOGLE_API_KEY=your_youtube_api_key_here
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_password
DB_NAME=fitness_db

```


4. **Run TypeORM Migrations** to set up the tables:
```bash
# Generate the initial migration
npx typeorm migration:generate -d ./datasource.js ./migrations/InitialSetup

# Apply the migration to your PostgreSQL DB
npx typeorm migration:run -d ./datasource.js

```

5. After migrations are completed run command
```bash
npm run dev
```



### 4. Frontend Setup

1. In a new terminal, navigate to the client:
```bash
cd client
npm install
npm start

```



---

## 📖 User Manual

### 💬 Fitness Chatbot

* Type your workout goal (e.g., *"shoulder mobility"* or *"weight gain exercises"*).
* The AI will intelligently map your words to fitness tags and recommend 4 videos.
* Click **"Watch Inside App"** to view the video without leaving the page.

### ⚙️ Tags & Logic Management (Admin)

* **Stop Words:** Manage words ignored by the search engine.
* **Synonym Map:** View terms the AI has "learned."
* **Visual Indicators:** **Red rows** indicate new words learned from user chats that require verification or further synonym setup.
* **Seed Data:** Use the **Load Defaults** button to instantly populate the logic from the `synonyms.json` and `stopwords.json` files.

### 📁 Video Management

* Add, edit, or delete workout videos manually.
* The system automatically seeds the database with new content via the daily Cron job.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

**Developed by [Adeeba Maqbool**](https://www.google.com/search?q=https://github.com/AdeMaq)

```
