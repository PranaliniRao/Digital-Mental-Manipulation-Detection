import time
import json

from agents.intent import IntentAgent
from agents.vulnerability import VulnerabilityAgent
from agents.emotion_exploitation import EmotionExploitationAgent
from agents.strategy import StrategyAgent
from agents.context import ContextAgent
from agents.motive import MotiveAgent
from agents.bias import BiasAgent
from agents.relationship import RelationshipAgent

# ── Shared analysis dictionary ──────────────────────────────────────────────
analysis = {
    "text_analyzed": "If you truly loved me, you would do this for me without question.",
    "roberta_output": {
        "label": "manipulative",
        "confidence": 0.8537,
    },
    "emotion_output": {
        "primary_emotion": "joy",
        "confidence": 0.4785,
        "all_emotions": {
            "joy": 0.4785, "neutral": 0.2436, "anger": 0.1928,
            "disgust": 0.0511, "sadness": 0.0150, "fear": 0.0105, "surprise": 0.0085,
        },
    },
    "vision_output": None,
}

# ── Build context string (mirrors orchestrator._build_agent_context) ─────────
def build_context(a: dict) -> str:
    text    = a["text_analyzed"]
    roberta = a["roberta_output"]
    emotion = a["emotion_output"]
    return (
        f"Text: {text}\n\n"
        f"RoBERTa: {roberta['label']} ({roberta['confidence']*100:.1f}% confidence)\n"
        f"Emotion: {emotion['primary_emotion']} ({emotion['confidence']*100:.1f}% confidence)\n"
        f"All Emotions: {', '.join(f'{k}: {v*100:.1f}%' for k, v in emotion['all_emotions'].items())}"
    )

context = build_context(analysis)

# ── Agent registry ────────────────────────────────────────────────────────────
AGENTS = [
    ("Intent",               IntentAgent()),
    ("Vulnerability",        VulnerabilityAgent()),
    ("Emotion Exploitation", EmotionExploitationAgent()),
    ("Strategy",             StrategyAgent()),
    ("Context",              ContextAgent()),
    ("Motive",               MotiveAgent()),
    ("Bias",                 BiasAgent()),
    ("Relationship",         RelationshipAgent()),
]

# ── Run ───────────────────────────────────────────────────────────────────────
print("\n" + "=" * 50)
print("              AGENTS — ALL TEST")
print("=" * 50)
print(f"\nInput: {analysis['text_analyzed']}\n")

total_start = time.perf_counter()
results = {}

for name, agent in AGENTS:
    print(f"{name} Agent...")
    t = time.perf_counter()
    result = agent.analyze(context)
    elapsed = time.perf_counter() - t
    label = result.get("label", "Unknown")
    conf  = result.get("confidence", 0.0) * 100
    print(f"  label    : {label}")
    print(f"  confidence: {conf:.1f}%")
    print(f"  time     : {elapsed:.2f}s\n")
    results[name] = result

total = time.perf_counter() - total_start

# ── Summary ───────────────────────────────────────────────────────────────────
print("=" * 50)
print("                  SUMMARY")
print("=" * 50)
for name, result in results.items():
    label = result.get("label", "Unknown")
    conf  = result.get("confidence", 0.0) * 100
    status = "OK" if label not in ("Unknown", "None", None) else "FAIL"
    print(f"  [{status}] {name:<22}: {label} ({conf:.1f}%)")

print(f"\nTotal Agent Time : {total:.2f}s")
print("=" * 50 + "\n")
