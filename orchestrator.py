"""
Orchestrator — Digital Manipulation Detector.

Pipeline for TEXT input:
    Text → RoBERTa → Emotion → Agents (read shared context) → Judge → Meta Judge

Pipeline for IMAGE input:
    Image → Vision Service (/analyze-image, called ONCE) → RoBERTa → Emotion
          → Agents (read shared vision_output) → Judge → Meta Judge

Qwen is invoked ONCE via POST /analyze-image (image inputs only).
The full response is stored in analysis["vision_output"] and shared
read-only with every downstream component. No component makes a
second HTTP request to Qwen.

NOT YET IMPLEMENTED:
    - Judge Agent
    - Meta Judge Agent
    - Report generation
"""

import os
import time

from services.vision_service import analyze_image
from services.roberta_service import predict_manipulation
from services.emotion_service import predict_emotion

from agents.intent import IntentAgent
from agents.vulnerability import VulnerabilityAgent
from agents.emotion_exploitation import EmotionExploitationAgent
from agents.strategy import StrategyAgent
from agents.context import ContextAgent
from agents.motive import MotiveAgent
from agents.bias import BiasAgent
from agents.relationship import RelationshipAgent
from agents.judge import JudgeAgent
from agents.metajudge import MetaJudgeAgent
from agents.defence import DefenceAgent

# ---------------------------------------------------------------------------
# Qwen Vision endpoint — update on every Colab restart
# Qwen is called ONCE per image via /analyze-image (vision_service.py).
# No other component calls Qwen directly.
# ---------------------------------------------------------------------------

QWEN_BASE_URL = "https://doorbell-veto-neurotic.ngrok-free.dev"

# ---------------------------------------------------------------------------
# Agent registry — order defines execution sequence
# ---------------------------------------------------------------------------

_AGENT_REGISTRY = [
    ("intent",               IntentAgent()),
    ("vulnerability",        VulnerabilityAgent()),
    ("emotion_exploitation", EmotionExploitationAgent()),
    ("strategy",             StrategyAgent()),
    ("context",              ContextAgent()),
    ("motive",               MotiveAgent()),
    ("bias",                 BiasAgent()),
    ("relationship",         RelationshipAgent()),
]

_JUDGE_AGENT = JudgeAgent()
_META_JUDGE_AGENT = MetaJudgeAgent()
_DEFENCE_AGENT = DefenceAgent()

# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff", ".gif"}


def _is_image_path(input_value: str) -> bool:
    """Return True if the input string looks like a path to a supported image file."""
    _, ext = os.path.splitext(input_value)
    return ext.lower() in _IMAGE_EXTENSIONS


def _extract_text_from_vision(vision_result: dict) -> str:
    """
    Pull OCR / descriptive text from the Vision Service response.
    Checks top-level keys first, then one level deep for nested structures
    such as Qwen's visual_facts dict.
    """
    _TEXT_KEYS = ("ocr_text", "text", "extracted_text", "description",
                  "scene_description", "content", "result")

    for key in _TEXT_KEYS:
        value = vision_result.get(key)
        if value and isinstance(value, str) and value.strip():
            return value.strip()

    for nested in vision_result.values():
        if isinstance(nested, dict):
            for key in _TEXT_KEYS:
                value = nested.get(key)
                if value and isinstance(value, str) and value.strip():
                    return value.strip()

    return ""



def _build_agent_context(analysis: dict) -> str:
    """
    Build a structured context string from the shared analysis dictionary.
    This is passed to every agent as their input — no HTTP calls made.
    Combines: original text + RoBERTa + Emotion + Vision (if image input).
    """
    text    = analysis["text_analyzed"]
    roberta = analysis["roberta_output"]
    emotion = analysis["emotion_output"]
    vision  = analysis.get("vision_output")

    context = f"""Text: {text}

RoBERTa: {roberta['label']} ({roberta['confidence'] * 100:.1f}% confidence)
Emotion: {emotion['primary_emotion']} ({emotion['confidence'] * 100:.1f}% confidence)
All Emotions: {', '.join(f"{k}: {v*100:.1f}%" for k, v in emotion['all_emotions'].items())}"""

    if vision:
        vf = vision.get("visual_facts", {})
        po = vision.get("psychological_observations", {})
        context += f"""

Vision Analysis (Qwen):
  Scene        : {vf.get('scene_description', 'N/A')}
  Objects      : {', '.join(vf.get('objects', [])) or 'none'}
  Emotional Tone: {', '.join(po.get('emotional_tone', [])) or 'none'}
  Urgency Cues : {', '.join(po.get('urgency_cues', [])) or 'none'}
  Fear Cues    : {', '.join(po.get('fear_cues', [])) or 'none'}
  Persuasion   : {', '.join(po.get('visual_persuasion', [])) or 'none'}
  Propaganda   : {', '.join(po.get('propaganda_elements', [])) or 'none'}"""

    return context


def _run_agents(analysis: dict) -> tuple[dict, float]:
    """
    Run all 8 specialized agents sequentially.
    Each agent reads from the shared analysis dict — no HTTP calls.
    The context string (text + RoBERTa + Emotion + Vision) is built once
    and passed as the input text to every agent's parse_response().

    Returns (agents_dict, total_time).
    """
    print()
    print("=" * 50)
    print("              AGENTS \u2014 ANALYSIS")
    print("=" * 50)
    print()

    # Build the shared context once — all agents read the same input
    context = _build_agent_context(analysis)

    agents_start = time.perf_counter()
    results = {}

    for key, agent in _AGENT_REGISTRY:
        print(f"{agent.agent_name}...")
        t = time.perf_counter()
        try:
            result = agent.analyze(context)
            elapsed = time.perf_counter() - t
            print(f"\u2713 Complete ({elapsed:.3f}s)  label: {result.get('label')}  conf: {result.get('confidence', 0.0)*100:.1f}%")
            results[key] = result
        except Exception as e:
            elapsed = time.perf_counter() - t
            print(f"\u2717 Failed  ({elapsed:.3f}s) \u2014 {e}")
            results[key] = {
                "agent_name": agent.agent_name,
                "error": str(e),
                "label": "error",
                "confidence": 0.0,
                "reasoning": f"Agent raised an exception: {e}",
                "evidence": [],
                "risk_contribution": 0.0,
            }
        print()

    total_agent_time = time.perf_counter() - agents_start
    print(f"{'Total Agent Time':<22}: {total_agent_time:.2f}s")
    print()

    return results, total_agent_time


def _run_judge(analysis: dict) -> tuple[dict, float]:
    """Run the Judge using only the completed shared analysis dictionary."""
    print("=" * 50)
    print("              JUDGE — ANALYSIS")
    print("=" * 50)

    started = time.perf_counter()
    try:
        result = _JUDGE_AGENT.analyze(analysis)
        elapsed = time.perf_counter() - started
        print(f"✓ Complete ({elapsed:.3f}s)  decision: {result['decision']}  conf: {result['confidence'] * 100:.1f}%")
    except Exception as e:
        elapsed = time.perf_counter() - started
        print(f"✗ Failed  ({elapsed:.3f}s) — {e}")
        result = {
            "decision": "no_manipulation",
            "confidence": 0.0,
            "reasoning": f"Judge raised an exception: {e}",
            "evidence": [],
            "summary": "Judge could not produce a decision.",
        }

    print()
    return result, elapsed


def _run_meta_judge(analysis: dict) -> tuple[dict, float]:
    """Run the Meta Judge using only the completed shared analysis dictionary."""
    print("=" * 50)
    print("           META JUDGE — FINAL DECISION")
    print("=" * 50)

    started = time.perf_counter()
    try:
        result = _META_JUDGE_AGENT.analyze(analysis)
        elapsed = time.perf_counter() - started
        print(f"✓ Complete ({elapsed:.3f}s)  decision: {result['final_decision']}  "
              f"conf: {result['confidence'] * 100:.1f}%  "
              f"agreement: {result['agreement_score']:.2f}")
    except Exception as e:
        elapsed = time.perf_counter() - started
        print(f"✗ Failed  ({elapsed:.3f}s) — {e}")
        result = {
            "final_decision": analysis.get("judge", {}).get("decision", "no_manipulation"),
            "confidence": 0.0,
            "agreement_score": 0.0,
            "conflicting_agents": [],
            "reasoning": f"Meta Judge raised an exception: {e}",
            "final_summary": "Meta Judge could not produce a decision.",
        }

    print()
    return result, elapsed


def _run_defence(analysis: dict) -> tuple[dict, float]:
    """Run the Defence Agent using only the completed shared analysis dictionary."""
    print("=" * 50)
    print("           DEFENCE AGENT — PROTECTIVE STRATEGIES")
    print("=" * 50)

    started = time.perf_counter()
    try:
        result = _DEFENCE_AGENT.analyze(analysis)
        elapsed = time.perf_counter() - started
        print(f"✓ Complete ({elapsed:.3f}s)  threat: {result.get('threat_category', 'N/A')}  "
              f"risk: {result.get('risk_level', 'N/A')}  conf: {result.get('confidence', 0.0) * 100:.1f}%")
    except Exception as e:
        elapsed = time.perf_counter() - started
        print(f"✗ Failed  ({elapsed:.3f}s) — {e}")
        result = {
            "agent_name": "Defence Agent",
            "threat_category": "none",
            "risk_level": "low",
            "confidence": 0.0,
            "protective_actions": [],
            "communication_boundaries": [],
            "manipulation_education": f"Defence Agent raised an exception: {e}",
            "counter_strategies": [],
            "escalation_recommendation": {
                "needed": False,
                "reason": "",
                "suggested_action": ""
            }
        }

    print()
    return result, elapsed


# ---------------------------------------------------------------------------
# Public interface
# ---------------------------------------------------------------------------

def analyze(input_value: str) -> dict:
    """
    Run the full orchestration pipeline on a text string or image path.

    TEXT  → RoBERTa → Emotion → Agents (read shared context)
    IMAGE → Vision  → Qwen (once) → RoBERTa → Emotion → Agents (read shared context)

    Returns a unified analysis dictionary.
    """
    total_start = time.perf_counter()

    print()
    print("=" * 50)
    print("           ORCHESTRATOR \u2014 ANALYSIS START")
    print("=" * 50)

    # ----------------------------------------------------------------
    # Stage 1 : Detect input type
    # ----------------------------------------------------------------
    input_type = "image" if _is_image_path(input_value) else "text"

    print()
    print(f"Input Type   : {input_type.upper()}")
    print(f"Input Value  : {input_value[:80]}{'...' if len(input_value) > 80 else ''}")
    print()

    # ----------------------------------------------------------------
    # Stage 2 : Vision Service (image only)
    # ----------------------------------------------------------------
    vision_output   = None
    vision_time     = None
    text_to_analyze = input_value

    if input_type == "image":
        print("-" * 50)
        print("Stage 1/3 \u2014 Vision Service (Qwen /analyze-image)")
        print("-" * 50)

        t = time.perf_counter()
        try:
            vision_output = analyze_image(input_value)
            vision_time = time.perf_counter() - t

            text_to_analyze = _extract_text_from_vision(vision_output)

            if text_to_analyze:
                print(f"\u2713 Qwen response received, text extracted ({len(text_to_analyze)} chars)")
            else:
                print("\u26a0 Qwen response received, no text extracted \u2014 visual context will be used")

            print(f"  Vision/Qwen time : {vision_time:.2f}s")
        except Exception as e:
            vision_time = time.perf_counter() - t
            print(f"\u2717 Vision Service failed: {e}")
            print(f"  Vision/Qwen time : {vision_time:.2f}s")
            # Continue with empty vision output - text-only analysis
            vision_output = None
            text_to_analyze = input_value
        print()

    # ----------------------------------------------------------------
    # Stage 2 : RoBERTa Service
    # ----------------------------------------------------------------
    print("-" * 50)
    stage = "Stage 2/3" if input_type == "image" else "Stage 1/2"
    print(f"{stage} \u2014 RoBERTa Manipulation Detection")
    print("-" * 50)

    t = time.perf_counter()
    try:
        roberta_output = predict_manipulation(text_to_analyze)
        roberta_time = time.perf_counter() - t
        print(f"  RoBERTa time : {roberta_time:.2f}s")
    except Exception as e:
        roberta_time = time.perf_counter() - t
        print(f"\u2717 RoBERTa Service failed: {e}")
        print(f"  RoBERTa time : {roberta_time:.2f}s")
        # Fallback response
        roberta_output = {
            "label": "non_manipulative",
            "is_manipulative": False,
            "confidence": 0.0,
            "probabilities": {
                "manipulative": 0.0,
                "non_manipulative": 1.0,
            },
        }
    print()

    # ----------------------------------------------------------------
    # Stage 3 : Emotion Service
    # ----------------------------------------------------------------
    print("-" * 50)
    stage = "Stage 3/3" if input_type == "image" else "Stage 2/2"
    print(f"{stage} \u2014 Emotion Analysis")
    print("-" * 50)

    t = time.perf_counter()
    try:
        emotion_output = predict_emotion(text_to_analyze)
        emotion_time = time.perf_counter() - t
        print(f"  Emotion time : {emotion_time:.2f}s")
    except Exception as e:
        emotion_time = time.perf_counter() - t
        print(f"\u2717 Emotion Service failed: {e}")
        print(f"  Emotion time : {emotion_time:.2f}s")
        # Fallback response
        emotion_output = {
            "primary_emotion": "neutral",
            "confidence": 0.0,
            "all_emotions": {
                "neutral": 1.0,
            },
        }
    print()

    # ----------------------------------------------------------------
    # Stage 4 : Agents — read shared analysis, zero HTTP calls
    # ----------------------------------------------------------------
    shared_analysis = {
        "input_type":     input_type,
        "text_analyzed":  text_to_analyze,
        "vision_output":  vision_output,   # contains full Qwen response for image inputs
        "roberta_output": roberta_output,
        "emotion_output": emotion_output,
    }

    agents_results, agents_time = _run_agents(shared_analysis)
    shared_analysis["agents"] = agents_results

    # ----------------------------------------------------------------
    # Stage 5 : Judge — aggregates the completed shared analysis only
    # ----------------------------------------------------------------
    judge_result, judge_time = _run_judge(shared_analysis)
    shared_analysis["judge"] = judge_result

    # ----------------------------------------------------------------
    # Stage 6 : Meta Judge — final arbitration over completed analysis
    # ----------------------------------------------------------------
    meta_judge_result, meta_judge_time = _run_meta_judge(shared_analysis)
    shared_analysis["meta_judge"] = meta_judge_result

    # ----------------------------------------------------------------
    # Stage 7 : Defence Agent — protective strategies and recommendations
    # ----------------------------------------------------------------
    defence_result, defence_time = _run_defence(shared_analysis)
    shared_analysis["defence"] = defence_result

    # ----------------------------------------------------------------
    # Summary
    # ----------------------------------------------------------------
    total_time = time.perf_counter() - total_start

    print("=" * 50)
    print("                    SUMMARY")
    print("=" * 50)
    print(f"{'Input Type':<22}: {input_type}")
    print(f"{'Qwen/Vision':<22}: {'1 call via /analyze-image' if vision_output else 'skipped (text input)'}")
    print(f"{'RoBERTa Label':<22}: {roberta_output.get('label', 'N/A')}")
    print(f"{'RoBERTa Confidence':<22}: {roberta_output.get('confidence', 0.0) * 100:.2f}%")
    print(f"{'Primary Emotion':<22}: {emotion_output.get('primary_emotion', 'N/A').capitalize()}")
    print(f"{'Emotion Confidence':<22}: {emotion_output.get('confidence', 0.0) * 100:.2f}%")
    print()

    print("Judge")
    print("-" * 22)
    print(f"  {'Decision':<20}: {judge_result.get('decision', 'N/A')}")
    print(f"  {'Confidence':<20}: {judge_result.get('confidence', 0.0) * 100:.1f}%")
    print()

    print("Meta Judge")
    print("-" * 22)
    print(f"  {'Final Decision':<20}: {meta_judge_result.get('final_decision', 'N/A')}")
    print(f"  {'Confidence':<20}: {meta_judge_result.get('confidence', 0.0) * 100:.1f}%")
    print(f"  {'Agreement Score':<20}: {meta_judge_result.get('agreement_score', 0.0):.2f}")
    print(f"  {'Conflicting Agents':<20}: {meta_judge_result.get('conflicting_agents', [])}")
    print()

    print("Defence Agent")
    print("-" * 22)
    print(f"  {'Threat Category':<20}: {defence_result.get('threat_category', 'N/A')}")
    print(f"  {'Risk Level':<20}: {defence_result.get('risk_level', 'N/A')}")
    print(f"  {'Confidence':<20}: {defence_result.get('confidence', 0.0) * 100:.1f}%")
    print(f"  {'Protective Actions':<20}: {len(defence_result.get('protective_actions', []))}")
    print(f"  {'Escalation Needed':<20}: {defence_result.get('escalation_recommendation', {}).get('needed', False)}")
    print()

    print("Agents")
    print("-" * 22)
    for key, _ in _AGENT_REGISTRY:
        result = agents_results.get(key, {})
        if "error" in result:
            print(f"  {key:<22}: ERROR")
        else:
            print(f"  {key:<22}: {result.get('label', 'N/A')} ({result.get('confidence', 0.0) * 100:.1f}%)")
    print()

    print("Timing")
    print("-" * 22)
    if vision_time is not None:
        print(f"{'Vision/Qwen':<22}: {vision_time:.2f}s")
    print(f"{'RoBERTa Service':<22}: {roberta_time:.2f}s")
    print(f"{'Emotion Service':<22}: {emotion_time:.2f}s")
    print(f"{'Agents Total':<22}: {agents_time:.2f}s")
    print(f"{'Judge':<22}: {judge_time:.2f}s")
    print(f"{'Meta Judge':<22}: {meta_judge_time:.2f}s")
    print(f"{'Defence Agent':<22}: {defence_time:.2f}s")
    print(f"{'Total':<22}: {total_time:.2f}s")
    print()
    print("=" * 50)
    print("         ORCHESTRATOR \u2014 ANALYSIS COMPLETE")
    print("=" * 50)
    print()

    return {
        "input_type":     input_type,
        "original_input": input_value,
        "text_analyzed":  text_to_analyze,
        "vision_output":  vision_output,
        "roberta_output": roberta_output,
        "emotion_output": emotion_output,
        "agents":         agents_results,
        "judge":          judge_result,
        "meta_judge":     meta_judge_result,
        "defence":        defence_result,
        "timing": {
            "vision_service":  vision_time,
            "roberta_service": roberta_time,
            "emotion_service": emotion_time,
            "agents_total":    agents_time,
            "judge":           judge_time,
            "meta_judge":      meta_judge_time,
            "defence":         defence_time,
            "total":           total_time,
        },
    }
