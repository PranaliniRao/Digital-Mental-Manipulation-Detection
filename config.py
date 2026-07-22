"""
Configuration — loads environment variables and provides centralized config.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# API Keys
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Vision Service (Qwen) — update on every Colab restart
QWEN_API_URL = "https://doorbell-veto-neurotic.ngrok-free.dev/analyze-image"


# Model paths
ROBERTA_MODEL_PATH = "ai_models/roberta"
EMOTION_MODEL_PATH = "ai_models/emotion"

# LLM Model
LLM_MODEL_NAME = "llama-3.3-70b-versatile"
