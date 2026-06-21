# Multi-Agent AI Employability Copilot for Students

An intelligent career copilot designed for students to identify target role benchmarks, locate technical gaps, generate personalized milestones, review custom project specifications, and participate in mock technical recruiter conversations.

Features a premium, GPU-accelerated **obsidian glassmorphic interface** themed in a cool tech teal and cyan color palette.

---

## 🏛️ System Architecture & Multi-Agent Design

This platform is powered by 7 specialized AI Agents, structured inside a clean OOP paradigm:
1.  **Resume Parser Agent**: Reads extracted text from PDF resumes using the Gemini JSON API, converting the text into structured profile models.
2.  **Skill Gap Analyzer Agent**: Conducts semantic matching between student profiles and standard target roles.
3.  **Employability Scoring Agent**: Computes a multi-dimensional career-readiness rating out of 100.
4.  **Roadmap Generator Agent**: Constructs structured monthly milestone paths to teach missing competencies.
5.  **Project Recommendation Agent**: Suggests innovative portfolio projects that bridge tech gaps.
6.  **Interview Coach Agent**: Simulates real technical recruiter screenings, evaluating text answers.
7.  **Job Matching Agent**: Computes sub-millisecond skill-alignment metrics against seed database listings.

---

## 🎨 Premium Visual Theme (Teal/Cyan Palette)
The application has been styled with a modern tech aesthetic:
*   **Obsidian Dark Gradient**: A dark navy/slate base gradient (`#0a1620` to `#0a1a1f`) with a slow, CSS-animated color drift.
*   **Ambient Glow Meshes**: Soft background radial glow blobs in cyan (`#06b6d4`), teal (`#14b8a6`), and light cyan (`#22d3ee`).
*   **Active Particle Canvas**: An overlay rendering floating light teal (`#5eead4`) network particles, dynamic connection lines, and pulsing agent nodes.
*   **Minimalist Glassmorphism**: Cards feature semi-transparent dark backdrops, subtle teal borders (`rgba(20, 184, 166, 0.15)`), and soft cyan box-shadow glows.
*   **Text-focused Sidebar**: Sidebar buttons style text in high-brightness white (`#ffffff`) for readability, transitioning to light teal on hover, with a dedicated cyan border marker for the active view.

---

## 🛠️ Technology Stack

*   **Frontend**: React (Vite) + Lucide Icons + custom Canvas Particle System + Vanilla CSS.
*   **Backend**: Python + FastAPI + SQLAlchemy.
*   **Database**: SQLite (`backend/copilot.db`) or any compatible PostgreSQL database (e.g., Supabase).
*   **AI Engine**: Gemini 2.5 Flash API.

---

## 🚀 Setup & Installation Guide

Ensure you have **Node.js (v18+)** and **Python 3.10+** installed on your system.

### 1. Clone & Workspace Setup
Extract the repository folder and open your terminal inside the root directory.

### 2. Backend Setup
1. Open a terminal inside the root directory and configure a python virtual environment:
   ```bash
   python -m venv venv
   # On Windows (CMD):
   .\venv\Scripts\activate
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On macOS/Linux:
   source venv/bin/activate
   ```
2. Install the backend dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Create a `.env` file in the `backend/` folder and insert your Gemini API Key:
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   ```

### 3. Frontend Setup
1. Open a new terminal in the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install node dependencies:
   ```bash
   npm install
   ```

---

## 🏃 Running the Application Locally

You must run both the backend server and frontend development server in parallel.

### 1. Start the FastAPI Backend
From the root directory (ensure virtual environment is active):
```bash
python -m uvicorn backend.main:app --reload
```
The API server will launch at `http://localhost:8000`. You can inspect the interactive OpenAPI documentation at `http://localhost:8000/docs`.

### 2. Start the React Frontend
From the `frontend` directory:
```bash
npm run dev
```
The React application will launch at `http://localhost:5173`. Open this URL in your web browser.

---

## 🧪 Verification & Local Testing
We have included a verification script to run database actions and evaluate agent chains locally:
```bash
# Ensure virtual environment is active
python backend/verify_backend.py
```
This script will seed the database, insert a mock student profile, map skill gaps for a target role, compute scores, and run a mock recruiter evaluation.

