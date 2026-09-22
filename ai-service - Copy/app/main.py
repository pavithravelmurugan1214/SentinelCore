from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.chatbot import ask_ai, analyze_alert_ai

import app.chatbot

print("Loaded chatbot from:", app.chatbot.__file__)

app = FastAPI(
    title="SentinelCore AI Service",
    version="1.0.0"
)


# ==========================================
# CORS - DEVELOPMENT CONFIGURATION
# ==========================================

app.add_middleware(
    CORSMiddleware,

    # Allow localhost / 127.0.0.1 on any Vite port
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ==========================================
# Request Models
# ==========================================

class ChatRequest(BaseModel):
    question: str


class AlertRequest(BaseModel):
    title: str
    severity: str
    description: str
    sourceIp: str


# ==========================================
# Home
# ==========================================

@app.get("/")
def home():
    return {
        "status": "running",
        "service": "SentinelCore AI Service"
    }


# ==========================================
# AI Chat
# ==========================================

@app.post("/chat")
def chat(request: ChatRequest):

    print("Chat request received:", request.question)

    answer = ask_ai(request.question)

    return {
        "answer": answer
    }


# ==========================================
# AI Alert Analysis
# ==========================================

@app.post("/analyze-alert")
def analyze_alert(request: AlertRequest):

    analysis = analyze_alert_ai(
        request.title,
        request.severity,
        request.description,
        request.sourceIp
    )

    return {
        "analysis": analysis
    }