import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client with proper User-Agent
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

/**
 * POST /analyze
 * Agent 1: Analyzes the original email semantics
 */
app.post("/analyze", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email content is required and must be a string." });
    }

    console.log("Agent 1 (Node): Analyzing email semantic intent...");

    const systemInstruction = `You are an expert Intent Detection Agent. Your sole purpose is to analyze the provided email and extract structural metadata.
Do NOT generate any reply to the email. Analyze only.

Extract the following:
1. Intent: Categorize the primary goal or intent of the sender.
   Must be exactly one of the following:
   - Meeting Request
   - Interview Invitation
   - Complaint
   - Project Update
   - Payment Reminder
   - Information Request
   - Leave Request
   - Feedback

2. Tone: Determine the emotional tone of the email.
   Must be exactly one of the following:
   - Professional
   - Friendly
   - Angry
   - Urgent
   - Neutral
   - Happy

3. Priority: Evaluate the level of response priority.
   Must be exactly one of the following:
   - High
   - Medium
   - Low

4. Summary: Provide a concise, clear one-sentence summary of the email's core message.

You MUST respond strictly with a valid JSON object. Do NOT include markdown tags like \`\`\`json or \`\`\`.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Email Content:\n"""\n${email}\n"""`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: {
              type: Type.STRING,
              description: "The main purpose or intent of the email",
            },
            tone: {
              type: Type.STRING,
              description: "The emotional tone of the email",
            },
            priority: {
              type: Type.STRING,
              description: "The priority of the email (High, Medium, Low)",
            },
            summary: {
              type: Type.STRING,
              description: "A very brief 1-sentence summary of the email",
            },
          },
          required: ["intent", "tone", "priority", "summary"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No response returned from the Gemini API.");
    }

    res.json(JSON.parse(jsonText.trim()));
  } catch (error: any) {
    console.error("Express /analyze error:", error);
    res.status(500).json({ error: error?.message || "Internal server error during analysis." });
  }
});

/**
 * POST /reply
 * Cooperative Workflow:
 * 1. Automatically runs Agent 1 internally to parse Intent and Tone
 * 2. Runs Agent 2 (Writer Agent) to draft a tailored reply in the requested style
 */
app.post("/reply", async (req, res) => {
  try {
    const { email, style } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email content is required." });
    }
    const selectedStyle = style || "Formal";

    console.log(`Agentic Workflow (Node): Triggering analysis pipeline before drafting...`);

    // 1. Analyze Email Semantics Internally
    const analysisInstruction = `Analyze the email to extract intent and tone. Return JSON only.`;
    const analysisResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Email:\n"""\n${email}\n"""`,
      config: {
        systemInstruction: analysisInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: { type: Type.STRING },
            tone: { type: Type.STRING },
          },
          required: ["intent", "tone"],
        }
      }
    });

    let analysis = { intent: "Information Request", tone: "Neutral" };
    try {
      if (analysisResponse.text) {
        analysis = JSON.parse(analysisResponse.text.trim());
      }
    } catch (e) {
      console.warn("Could not parse dynamic analysis during reply generation, using defaults.");
    }

    console.log(`Agentic Workflow (Node): Dispatching drafted task to Writer Agent. Intent: '${analysis.intent}', Tone: '${analysis.tone}', Style: '${selectedStyle}'`);

    // 2. Draft Reply
    const replyInstruction = `You are an expert Reply Generation Agent. Your purpose is to write a highly professional, contextual, and ready-to-send email reply based on the original email content, its analyzed intent, tone, and the user's requested Reply Style.

The requested Reply Style is: ${selectedStyle}
Original Email Intent: ${analysis.intent}
Original Email Tone: ${analysis.tone}

Guidelines for drafting the response:
- Keep the language natural, concise, and highly polished.
- Maintain appropriate professional etiquette.
- Ensure the reply directly addresses any explicit questions or requests made in the original email.
- The output must be the final ready-to-send email content ONLY. Do NOT include explanations, notes, metadata, or markdown wrappers.
- Do not use generic placeholders like "[Your Name]" unless appropriate. Keep standard, professional salutations and signature blocks.`;

    const userPrompt = `Original Email:
"""
${email}
"""

Draft the reply now:`;

    const replyResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: replyInstruction,
      }
    });

    const replyText = replyResponse.text;
    if (!replyText) {
      throw new Error("No response from Gemini API for reply generation");
    }

    res.json({ reply: replyText.trim() });
  } catch (error: any) {
    console.error("Express /reply error:", error);
    res.status(500).json({ error: error?.message || "Internal server error during reply generation." });
  }
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, "frontend")));

// Fallback to index.html for SPA/root requests
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// Start listening
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
