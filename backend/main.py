"""
FastAPI Backend App for Agentic AI Email Reply Generator
"""
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import AnalyzeRequest, AnalyzeResponse, ReplyRequest, ReplyResponse
from agents import IntentDetectionAgent, ReplyGenerationAgent

app = FastAPI(
    title="Agentic AI Email Reply Generator Backend",
    description="FastAPI service hosting two cooperative AI agents: Intent Analyzer & Reply Writer.",
    version="1.0.0"
)

# Enable CORS for frontend connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instantiate Agents
analyzer_agent = IntentDetectionAgent()
writer_agent = ReplyGenerationAgent()



@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_email(request: AnalyzeRequest):
    """
    POST /analyze endpoint
    Triggers Agent 1 (Intent Detection Agent) to extract metadata.
    """
    email_content = request.email.strip()
    if not email_content:
        raise HTTPException(status_code=400, detail="Email content cannot be empty.")
    
    print(f"Triggering Agent 1 for email analysis...")
    analysis_result = analyzer_agent.analyze(email_content)
    
    return AnalyzeResponse(
        intent=analysis_result.get("intent", "Information Request"),
        tone=analysis_result.get("tone", "Neutral"),
        priority=analysis_result.get("priority", "Medium"),
        summary=analysis_result.get("summary", "No summary captured.")
    )

@app.post("/reply", response_model=ReplyResponse)
async def generate_reply(request: ReplyRequest):
    """
    POST /reply endpoint
    Triggers the multi-agent cooperative loop:
    1. Agent 1 analyzes original email to extract context (Intent & Tone).
    2. Agent 2 ingests the original email, analysis metadata, and selected style to draft a tailored response.
    """
    email_content = request.email.strip()
    if not email_content:
        raise HTTPException(status_code=400, detail="Email content cannot be empty.")
    
    print(f"Executing Agentic workflow for email reply generation...")
    
    # 1. Pipeline Analysis Step (Agent 1)
    print("-> Phase 1: Analyzing email semantics...")
    analysis_result = analyzer_agent.analyze(email_content)
    intent = analysis_result.get("intent", "Information Request")
    tone = analysis_result.get("tone", "Neutral")
    
    # 2. Reply Generation Step (Agent 2)
    print(f"-> Phase 2: Generating response in style '{request.style}' based on intent '{intent}' and tone '{tone}'...")
    reply_draft = writer_agent.generate_reply(
        email_content=email_content,
        intent=intent,
        tone=tone,
        style=request.style
    )
    
    return ReplyResponse(reply=reply_draft)
# -----------------------------
# Serve Frontend Files
# -----------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

@app.get("/")
async def serve_frontend():
    return FileResponse(FRONTEND_DIR / "index.html")
if __name__ == "__main__":
    # Standard Uvicorn startup
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)