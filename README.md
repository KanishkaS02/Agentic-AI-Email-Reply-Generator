# Agentic AI Email Reply Generator

A modern, full-stack, responsive web application designed to help users generate high-quality, professional email replies. Instead of relying on a single flat prompt, the application coordinates **two independent, cooperative AI agents** powered by the **Google Gemini 2.5 Flash API** to achieve deep semantic understanding and highly contextual writing drafts.

---

## 🚀 Project Overview

Standard email writing assistants often produce robotic, generic responses because they try to understand and write in a single shot. This application introduces an **agentic loop** divided into two phases:
1. **Agent 1 — Intent Detection Agent**: Scans the incoming email to diagnose its underlying purpose (Intent), emotional state (Tone), priority (Priority), and outputs a high-level executive summary.
2. **Agent 2 — Reply Generation Agent**: Ingests the original message alongside the diagnostic output of Agent 1 and customizes a highly personalized draft aligned with the user's preferred **Reply Style** (e.g. Formal, Friendly, Short, etc.).

This pipeline yields replies that are far more contextually precise and authentic.

---

## 🎨 Features

* **Dual-Agent Cooperative Workflow**: A modular pipeline that cleanly separates evaluation (analysis) from generation (writing).
* **Intent Categorization**: Dynamically detects the email category: *Meeting Request, Interview Invitation, Complaint, Project Update, Payment Reminder, Information Request, Leave Request, Feedback*.
* **Tone & Emotion Analysis**: Captures user sentiment: *Professional, Friendly, Angry, Urgent, Neutral, Happy*.
* **Responsive Bento Glassmorphism UI**: Beautiful, dark, responsive interface with frosted card designs, glowing states, smooth interactive feedback, and responsive loading indicators.
* **Six Reply Styles**: Tailor outputs to *Formal, Friendly, Short, Detailed, Apologetic, or Confident*.
* **Sample Presets**: Quick-load templates covering candidate interviews, angry customers, project syncs, and overdue invoices to experience the workflow instantly.
* **Inline Editing**: Live editable container allows fine-tuning draft copy before sending.
* **Clipboard Integration**: Single-click copying with floating toast status notification.

---

## 🛠️ Tech Stack

### Frontend
* **HTML5** & **CSS3** (with custom glassmorphism and keyframe animations).
* **Tailwind CSS** (for desktop-first fluid design).
* **Lucide Icons** (clean vector interfaces).
* **Vanilla JavaScript (ES6)** (using the Fetch API for full asynchronous action handling).

### Backend (Python Production Setup)
* **Python 3.11**
* **FastAPI** (lightning-fast API structures).
* **Uvicorn** (production-grade ASGI server).
* **Google Gemini 2.5 Flash API** (`google-generativeai`).
* **Pydantic** (data parsing & type safety).

---

## 📁 File Structure

```
agentic-email-reply-generator/
│
├── backend/
│   ├── main.py            # FastAPI Application & endpoint handlers
│   ├── agents.py          # IntentDetectionAgent and ReplyGenerationAgent classes
│   ├── prompts.py         # Advanced agentic prompt templates
│   ├── models.py          # Pydantic schema validation structures
│   ├── requirements.txt   # Pip package dependencies
│   └── .env               # Python environment secrets config
│
├── frontend/
│   ├── index.html         # User Interface
│   ├── style.css          # Custom typography & glassmorphism
│   └── script.js          # Asynchronous triggers & DOM controller
│
├── server.ts              # Node.js/Express dev server & proxy (for AI Studio live preview)
├── package.json           # Node configuration & compilation runner
└── README.md              # Project Documentation
```

---

## 🛠️ Installation & Setup

### Option A: Running the Production Python API (FastAPI)

#### 1. Configure Secrets
Navigate to the `backend/` directory, open `.env`, and insert your Gemini API Key:
```env
GEMINI_API_KEY="AIzaSyYourActualKeyGoesHere"
```

#### 2. Install Python Dependencies
Set up a virtual environment and install dependencies:
```bash
# Navigate to backend folder
cd backend

# Create Virtual Environment (Optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install required packages
pip install -r requirements.txt
```

#### 3. Run the FastAPI Server
Start Uvicorn with reloading active:
```bash
python main.py
```
The backend API will boot and run on **`http://localhost:8000`**. You can view interactive docs at `http://localhost:8000/docs`.

#### 4. Serve the Frontend
Simply open `/frontend/index.html` in any web browser, or host it locally using a light server:
```bash
# Example with python's built-in server
cd frontend
python -m http.server 3000
```

---

### Option B: Node.js Dev Environment (AI Studio Live Integration)

We also provide a fully compliant Node.js server inside `server.ts` to host both the APIs and serve static files directly under a unified port:

1. Add your `GEMINI_API_KEY` to the root `.env` or settings.
2. Install packages:
   ```bash
   npm install
   ```
3. Boot the development workspace:
   ```bash
   npm run dev
   ```
This boots an Express proxy on **`http://localhost:3000`** with the live frontend, bridging backend queries to the Google GenAI SDK automatically!

---

## 🔮 Future Enhancements

* **Workspace Email Integration**: Direct syncing with Gmail or Outlook to import and draft replies directly from your inbox.
* **Contextual History Retrieval**: Enabling agents to read historical thread backlogs to reference previous context.
* **Custom Persona Customizer**: Allow teams to create a custom dictionary of corporate guidelines or brand voices for Agent 2.
* **Multi-Language Support**: Automatic incoming language translation and corresponding reply drafting in selected foreign languages.
