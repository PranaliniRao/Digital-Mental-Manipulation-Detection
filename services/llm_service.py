"""
LLM Service — single integration point for Groq.
All agents call call_llm() from here. No other file imports the Groq SDK.
To swap providers in future, only this file needs to change.
"""

import os
import time
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

_MODEL_NAME = "llama-3.3-70b-versatile"
_client: Groq | None = None


def _get_client() -> Groq:
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise EnvironmentError(
                "GROQ_API_KEY not found. Add GROQ_API_KEY=<your_key> to your .env file."
            )
        _client = Groq(api_key=api_key)
        print(f"[LLM Service] Groq client initialized ({_MODEL_NAME})")
    return _client


def call_llm(prompt: str, system_prompt: str | None = None) -> str:
    """
    Send a prompt to Groq and return the generated text.
    Retries once on failure. Never returns None.
    """
    if not prompt or not prompt.strip():
        raise ValueError("[LLM Service] Prompt must not be empty.")

    client = _get_client()

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    for attempt in range(1, 3):
        try:
            t = time.perf_counter()
            response = client.chat.completions.create(
                model=_MODEL_NAME,
                messages=messages,
                temperature=0.2,
            )
            elapsed = time.perf_counter() - t
            print(f"[LLM Service] Response received in {elapsed:.2f}s (attempt {attempt})")

            text = response.choices[0].message.content
            if not text or not text.strip():
                raise ValueError("Groq returned an empty response.")
            return text.strip()

        except Exception as e:
            print(f"[LLM Service] Attempt {attempt} failed: {e}")
            if attempt == 2:
                raise RuntimeError(f"[LLM Service] Groq call failed after 2 attempts: {e}") from e
