# Agentic AI Classroom Teaching Assistant

A full-stack, AI-powered educational assistant for teachers and students. Built with React (TypeScript, Tailwind), FastAPI, SQLite, and Google Gemini.

## Prerequisites
- Node.js (v18+)
- Python (3.10+)
- Google Gemini API Key

## Setup Instructions

### 1. Configure the AI API Key
1. Navigate to the `backend` directory.
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and replace `your_gemini_api_key_here` with your actual Google Gemini API Key.

### 2. Start the Backend
1. Navigate to the `backend` directory.
2. Create and activate a virtual environment (if not already done):
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The backend will start at `http://localhost:8000`.

### 3. Start the Frontend
1. Open a new terminal and navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. The frontend will start, typically at `http://localhost:5173`.

### 4. Usage
1. Open the frontend in your browser.
2. Click **Register** to create a new account. You can choose to be a "Teacher" or a "Student".
3. Once logged in, explore the dashboard.
4. Go to **Quiz Generator** to generate a quiz. Enter a topic, select the number of questions (even 50+!), and click Generate. The backend will batch-generate large quizzes automatically.
5. Save generated materials to your **Library**.

## Features implemented
- Agentic Workflow (Understand, Plan, Generate, Evaluate, Personalize) using Gemini API.
- Batch generation for large quizzes.
- Secure JWT Authentication.
- Modern responsive dashboard using TailwindCSS.
- Saved library materials with SQLite.
