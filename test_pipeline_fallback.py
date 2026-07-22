import json
import os

import services.llm_service as llm_service
from agents.judge import JudgeAgent
from agents.metajudge import MetaJudgeAgent


def test_call_llm_returns_fallback_when_groq_key_missing(monkeypatch):
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    llm_service._client = None

    response = llm_service.call_llm("Urgent action now! Share this immediately before it is removed.")
    payload = json.loads(response)

    assert payload["label"] in {"manipulation", "no_manipulation"}
    assert payload["confidence"] >= 0.5
    assert payload["reasoning"]


def test_judge_and_meta_judge_can_fallback_without_llm(monkeypatch):
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    llm_service._client = None

    analysis = {
        "text_analyzed": "Share this now before it disappears.",
        "roberta_output": {"label": "manipulative", "confidence": 0.93},
        "emotion_output": {"primary_emotion": "fear", "confidence": 0.88, "all_emotions": {"fear": 0.88, "neutral": 0.12}},
        "agents": {
            "intent": {"label": "manipulation", "confidence": 0.9},
            "context": {"label": "no_manipulation", "confidence": 0.4},
        },
    }

    judge = JudgeAgent().analyze(analysis)
    meta = MetaJudgeAgent().analyze(analysis | {"judge": judge})

    assert judge["decision"] in {"manipulation", "no_manipulation"}
    assert judge["confidence"] >= 0.5
    assert meta["final_decision"] in {"manipulation", "no_manipulation"}
    assert meta["confidence"] >= 0.5
