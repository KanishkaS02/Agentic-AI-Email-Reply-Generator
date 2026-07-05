"""
AI Agents Implementation for Agentic AI Email Reply Generator
"""
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
from prompts import INTENT_DETECTION_PROMPT, REPLY_GENERATION_PROMPT

# Load environment variables
load_dotenv()

# Configure the Gemini API key
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

class IntentDetectionAgent:
    """
    Agent 1: Ingests raw email content and extracts semantic information:
    Intent, Tone, Priority, and Summary. Returns structured JSON dict.
    """
    def __init__(self):
        self.model_name = "gemini-2.5-flash"

    def analyze(self, email_content: str) -> dict:
        if not api_key:
            return {
                "intent": "Information Request",
                "tone": "Neutral",
                "priority": "Medium",
                "summary": "Error: GEMINI_API_KEY is not set in backend environment."
            }
            
        try:
            model = genai.GenerativeModel(
                model_name=self.model_name,
                system_instruction=INTENT_DETECTION_PROMPT
            )
            
            prompt = f"Analyze the following email content:\n\n{email_content}"
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            
            # Parse response text
            result = json.loads(response.text.strip())
            return result
        except Exception as e:
            print(f"Error in IntentDetectionAgent: {e}")
            # Fallback mock/graceful failure object
            return {
                "intent": "Information Request",
                "tone": "Neutral",
                "priority": "Medium",
                "summary": f"Could not perform deep semantic analysis. Error: {str(e)}"
            }

class ReplyGenerationAgent:
    """
    Agent 2: Ingests raw email content, semantic metadata from Agent 1, and the
    user's selected style to generate a tailored response email.
    """
    def __init__(self):
        self.model_name = "gemini-2.5-flash"

    def generate_reply(self, email_content: str, intent: str, tone: str, style: str) -> str:
        if not api_key:
            return "Error: GEMINI_API_KEY is not set in backend environment. Please verify your .env file."
            
        try:
            # Format custom instructions for writing agent
            system_instruction = REPLY_GENERATION_PROMPT.format(
                style=style,
                intent=intent,
                tone=tone
            )
            
            model = genai.GenerativeModel(
                model_name=self.model_name,
                system_instruction=system_instruction
            )
            
            prompt = f"Original Email:\n{email_content}\n\nDraft the reply now:"
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Error in ReplyGenerationAgent: {e}")
            return f"Error generating professional reply: {str(e)}"
