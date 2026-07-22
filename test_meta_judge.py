import time
from orchestrator import analyze
from agents.metajudge import MetaJudgeAgent


def print_meta_judge(result: dict) -> None:
    mj = result["meta_judge"]
    timing = result.get("timing", {})
    print("========== META JUDGE ==========")
    print(f"Agreement Score    : {mj['agreement_score']:.2f}")
    print(f"Conflicting Agents : {mj['conflicting_agents']}")
    print(f"Final Decision     : {mj['final_decision']}")
    print(f"Confidence         : {mj['confidence']:.2%}")
    print(f"Execution Time     : {timing.get('meta_judge', 0.0):.2f}s")
    print()


# ---------------------------------------------------------------------------
# Test 1 — Manipulative text
# ---------------------------------------------------------------------------
print("\n########## MANIPULATIVE TEXT ##########\n")
print_meta_judge(analyze("If you truly loved me, you would do this for me without question."))

# ---------------------------------------------------------------------------
# Test 2 — Neutral text
# ---------------------------------------------------------------------------
print("\n########## NEUTRAL TEXT ##########\n")
print_meta_judge(analyze("The quarterly financial report will be published next Monday."))

# ---------------------------------------------------------------------------
# Test 3 — Image
# ---------------------------------------------------------------------------
print("\n########## IMAGE ##########\n")
try:
    print_meta_judge(analyze(
        "C:/Users/l/OneDrive/Documents/PROJECTS/DIGI MANIP project/"
        "uploads/churei-tower-mount-fuji-in-japan-8k-68-1920x1080.jpg"
    ))
except Exception as exc:
    print(f"Image test skipped — Vision/Qwen service unavailable: {exc}\n")

# ---------------------------------------------------------------------------
# Test 4 — Intentional conflict:
#   RoBERTa = manipulation, Judge = no_manipulation, Bias Agent = manipulation
#   Meta Judge must detect the conflict and resolve it.
# ---------------------------------------------------------------------------
print("\n########## CONFLICT RESOLUTION TEST ##########")
print("Setup: RoBERTa=manipulation, Judge=no_manipulation, Bias=manipulation\n")

_conflict_analysis = {
    "input_type": "text",
    "text_analyzed": "You must act NOW or lose everything forever.",
    "vision_output": None,
    "roberta_output": {"label": "manipulation", "confidence": 0.91},
    "emotion_output": {
        "primary_emotion": "fear",
        "confidence": 0.85,
        "all_emotions": {"fear": 0.85, "neutral": 0.10, "anger": 0.05},
    },
    "agents": {
        "intent":               {"label": "fear induction",    "confidence": 0.88, "reasoning": "Induces fear of loss.", "evidence": ["act NOW", "lose everything"], "risk_contribution": 0.85},
        "vulnerability":        {"label": "fear",              "confidence": 0.82, "reasoning": "Targets fear vulnerability.", "evidence": ["lose everything forever"], "risk_contribution": 0.80},
        "emotion_exploitation": {"label": "fear",              "confidence": 0.87, "reasoning": "Exploits fear emotion.", "evidence": ["lose everything forever"], "risk_contribution": 0.85},
        "strategy":             {"label": "urgency tactics",   "confidence": 0.90, "reasoning": "Creates artificial urgency.", "evidence": ["act NOW"], "risk_contribution": 0.88},
        "context":              {"label": "suspicious / adversarial", "confidence": 0.78, "reasoning": "Adversarial framing.", "evidence": [], "risk_contribution": 0.75},
        "motive":               {"label": "control",           "confidence": 0.80, "reasoning": "Seeks behavioral control.", "evidence": [], "risk_contribution": 0.78},
        "bias":                 {"label": "scarcity bias",     "confidence": 0.86, "reasoning": "Exploits scarcity bias.", "evidence": ["lose everything forever"], "risk_contribution": 0.84},
        "relationship":         {"label": "unknown",           "confidence": 0.50, "reasoning": "Relationship unclear.", "evidence": [], "risk_contribution": 0.40},
    },
    "judge": {
        "decision":   "no_manipulation",   # <-- intentional conflict with majority
        "confidence": 0.55,
        "reasoning":  "Judge incorrectly concluded no manipulation.",
        "evidence":   [],
        "summary":    "Judge decision: no_manipulation (55.0% confidence).",
    },
}

_agent = MetaJudgeAgent()
t0 = time.perf_counter()
_mj = _agent.analyze(_conflict_analysis)
_elapsed = time.perf_counter() - t0

_conflict_result = {"meta_judge": _mj, "timing": {"meta_judge": _elapsed}}
print_meta_judge(_conflict_result)

print("Expected: Meta Judge should override Judge and return 'manipulation'")
print(f"Result  : {_mj['final_decision']}")
resolved = _mj["final_decision"] == "manipulation"
print(f"Conflict resolved correctly: {'YES ✓' if resolved else 'NO ✗'}")
