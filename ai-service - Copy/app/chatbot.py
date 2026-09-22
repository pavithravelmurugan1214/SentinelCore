from pathlib import Path
import requests

from app.tools import (
    count_alerts,
    count_incidents,
    count_threats,
    count_vulnerabilities,
    count_users,
)

OLLAMA_URL = "http://localhost:11434/api/generate"

knowledge_path = Path("knowledge/sentinelcore.md")
PROJECT_KNOWLEDGE = knowledge_path.read_text(encoding="utf-8")


# ----------------------------------
# Detect SentinelCore Questions
# ----------------------------------

def is_sentinelcore_question(question: str):

    keywords = [
        "sentinelcore",
        "dashboard",
        "alert",
        "alerts",
        "incident",
        "incidents",
        "threat",
        "threats",
        "vulnerability",
        "vulnerabilities",
        "playbook",
        "ioc",
        "report",
        "reports",
        "audit",
        "scanner",
        "security score",
        "system health",
        "user",
        "users"
    ]

    q = question.lower()

    return any(keyword in q for keyword in keywords)


# ----------------------------------
# Chat Assistant
# ----------------------------------

def ask_ai(question: str):

    q = question.lower().strip()

    # ----------------------------------
    # Dashboard Summary
    # ----------------------------------

    if "dashboard summary" in q:

        alerts = count_alerts()
        incidents = count_incidents()
        threats = count_threats()
        vulnerabilities = count_vulnerabilities()
        users = count_users()

        if alerts >= 30 or threats >= 15:
            risk = "🔴 High"
        elif alerts >= 10 or threats >= 5:
            risk = "🟠 Medium"
        else:
            risk = "🟢 Low"

        return f"""
📊 SentinelCore Dashboard Summary

🚨 Total Alerts: {alerts}
🛡 Total Incidents: {incidents}
⚠ Total Threats: {threats}
🔐 Total Vulnerabilities: {vulnerabilities}
👥 Total Users: {users}

Overall Risk Level: {risk}

Recommendations

• Review high severity alerts.
• Investigate unresolved incidents.
• Patch critical vulnerabilities.
• Monitor suspicious activities.
"""

    # ----------------------------------
    # Database Queries
    # ----------------------------------

    if "how many alerts" in q or "total alerts" in q:
        return f"There are {count_alerts()} alerts in SentinelCore."

    if "how many incidents" in q or "total incidents" in q:
        return f"There are {count_incidents()} incidents in SentinelCore."

    if "how many threats" in q or "total threats" in q:
        return f"There are {count_threats()} threats in SentinelCore."

    if "how many vulnerabilities" in q or "total vulnerabilities" in q:
        return f"There are {count_vulnerabilities()} vulnerabilities in SentinelCore."

    if "how many users" in q or "total users" in q:
        return f"There are {count_users()} users in SentinelCore."

    # ----------------------------------
    # Build AI Prompt
    # ----------------------------------

    if is_sentinelcore_question(question):

        prompt = f"""
You are SentinelCore AI Assistant.

Answer ONLY using the SentinelCore project knowledge.

PROJECT KNOWLEDGE

{PROJECT_KNOWLEDGE}

Question:
{question}

Rules:
- Maximum 80 words.
- Use simple English.
- Be direct.
- If information is not present in the project knowledge, say so.
"""

    else:

        prompt = f"""
You are an expert Cyber Security Assistant.

Question:
{question}

Rules:
- Maximum 80 words.
- Use simple English.
- Be direct.
- No unnecessary explanation.
"""

    try:

        response = requests.post(
            OLLAMA_URL,
            json={
                "model": "llama3.2:latest",
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.2,
                    "num_predict": 100
                }
            },
            timeout=120
        )

        response.raise_for_status()

        return response.json().get(
            "response",
            "No response generated."
        )

    except Exception as e:
        return f"Error communicating with Ollama: {e}"


# ----------------------------------
# AI Alert Analysis
# ----------------------------------

def analyze_alert_ai(title, severity, description, source_ip):

    prompt = f"""
You are a Senior SOC Analyst.

Analyze this security alert.

Alert Title:
{title}

Severity:
{severity}

Description:
{description}

Source IP:
{source_ip}

Return ONLY these sections.

Threat Summary:
Risk Level:
Possible Attack:
MITRE ATT&CK:
Investigation Steps:
Recommended Actions:

Rules:
- Maximum 150 words.
- Use bullet points where appropriate.
- Keep answers concise.
"""

    try:

        response = requests.post(
            OLLAMA_URL,
            json={
                "model": "llama3.2:latest",
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.2,
                    "num_predict": 180
                }
            },
            timeout=120
        )

        response.raise_for_status()

        return response.json().get(
            "response",
            "No response generated."
        )

    except Exception as e:
        return f"Error communicating with Ollama: {e}"