"""
Pydantic Models for Agentic AI Email Reply Generator
"""
from pydantic import BaseModel, Field
from typing import Optional

class AnalyzeRequest(BaseModel):
    email: str = Field(..., description="The content of the email to analyze")

class AnalyzeResponse(BaseModel):
    intent: str = Field(..., description="The detected intent of the email")
    tone: str = Field(..., description="The detected tone of the email")
    priority: str = Field(..., description="The priority level of the email (High/Medium/Low)")
    summary: str = Field(..., description="A brief one-sentence summary of the email")

class ReplyRequest(BaseModel):
    email: str = Field(..., description="The content of the original email")
    style: str = Field("Formal", description="The desired reply style (Formal, Friendly, Short, Detailed, Apologetic, Confident)")

class ReplyResponse(BaseModel):
    reply: str = Field(..., description="The generated professional reply")
