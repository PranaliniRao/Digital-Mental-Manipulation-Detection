"""
Report Service — Explainable Manipulation Report Generator.

Receives the complete shared analysis dictionary produced by the orchestrator.
Performs NO inference. Makes NO API calls. Only formats existing results.

Supported output formats:
  - console  : plain-text (implemented)
  - json     : structured dict  (implemented)
  - html     : HTML string      (placeholder)
  - pdf      : file export      (placeholder — not implemented)
"""

import time
from typing import Any, Dict

# ---------------------------------------------------------------------------
# Risk classification
# ---------------------------------------------------------------------------

def _risk_level(final_decision: str, confidence: float) -> str:
    if final_decision != "manipulation":
        if confidence >= 0.80:
            return "Very Low"
        return "Low"
    if confidence >= 0.90:
        return "Very High"
    if confidence >= 0.75:
        return "High"
    if confidence >= 0.50:
        return "Moderate"
    return "Low"


# ---------------------------------------------------------------------------
# Executive summary (pure string formatting — no LLM)
# ---------------------------------------------------------------------------

def _executive_summary(analysis: Dict[str, Any]) -> str:
    meta   = analysis.get("meta_judge", {})
    judge  = analysis.get("judge", {})
    agents = analysis.get("agents", {})
    emotion_out = analysis.get("emotion_output", {})

    decision   = meta.get("final_decision", judge.get("decision", "unknown"))
    confidence = meta.get("confidence", judge.get("confidence", 0.0))
    risk       = _risk_level(decision, confidence)

    lines = []

    if decision == "manipulation":
        lines.append(
            f"This content has been classified as MANIPULATIVE with {confidence*100:.1f}% confidence "
            f"(risk level: {risk})."
        )
    else:
        lines.append(
            f"This content has been classified as NON-MANIPULATIVE with {confidence*100:.1f}% confidence "
            f"(risk level: {risk})."
        )

    # Primary manipulation techniques from agents
    manip_agents = [
        (k, v) for k, v in agents.items()
        if v.get("label") and v["label"].lower() not in ("none", "no_manipulation", "error", "unknown", "")
    ]
    if manip_agents:
        techniques = ", ".join(f"{v['label']} ({k})" for k, v in manip_agents[:4])
        lines.append(f"Primary techniques detected: {techniques}.")

    # Emotional influence
    primary_emotion = emotion_out.get("primary_emotion", "")
    if primary_emotion and primary_emotion.lower() not in ("neutral",):
        lines.append(f"Dominant emotional influence: {primary_emotion.capitalize()}.")

    # Targeted vulnerabilities
    vuln = agents.get("vulnerability", {})
    if vuln.get("label") and vuln["label"].lower() not in ("none", "error", "unknown"):
        lines.append(f"Targeted vulnerability: {vuln['label']}.")

    # Key evidence
    evidence = meta.get("reasoning", "") or judge.get("reasoning", "")
    if evidence:
        short = evidence[:300].rstrip()
        if len(evidence) > 300:
            short += "..."
        lines.append(f"Key reasoning: {short}")

    # Conflicting agents note
    conflicting = meta.get("conflicting_agents", [])
    if conflicting:
        lines.append(
            f"Note: {len(conflicting)} signal(s) conflicted with the final decision "
            f"({', '.join(conflicting)}). The Meta Judge resolved these conflicts."
        )

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Console formatter
# ---------------------------------------------------------------------------

_DIV  = "=" * 52
_LINE = "-" * 52


def _fmt_console(analysis: Dict[str, Any]) -> str:
    parts = []
    a = parts.append

    roberta     = analysis.get("roberta_output", {})
    emotion_out = analysis.get("emotion_output", {})
    vision_out  = analysis.get("vision_output")
    agents      = analysis.get("agents", {})
    judge       = analysis.get("judge", {})
    meta        = analysis.get("meta_judge", {})
    input_type  = analysis.get("input_type", "text")
    text        = analysis.get("text_analyzed", "")

    # ── Header ──────────────────────────────────────────────────────────
    a(_DIV)
    a("   DIGITAL MANIPULATION DETECTOR — REPORT")
    a(_DIV)

    # ── 1. Input Information ─────────────────────────────────────────────
    a("\n1. INPUT INFORMATION")
    a(_LINE)
    a(f"  Input Type    : {input_type.upper()}")
    a(f"  Text Analyzed : {text[:200]}{'...' if len(text) > 200 else ''}")

    # ── 2. Vision Analysis (image only) ──────────────────────────────────
    if input_type == "image" and vision_out:
        a("\n2. VISION ANALYSIS  (Qwen)")
        a(_LINE)
        vf = vision_out.get("visual_facts", {})
        po = vision_out.get("psychological_observations", {})
        vc = vision_out.get("confidence", vision_out.get("vision_confidence", "N/A"))
        a(f"  OCR / Scene   : {vf.get('scene_description', 'N/A')}")
        a(f"  Objects       : {', '.join(vf.get('objects', [])) or 'none'}")
        a(f"  Emotional Tone: {', '.join(po.get('emotional_tone', [])) or 'none'}")
        a(f"  Urgency Cues  : {', '.join(po.get('urgency_cues', [])) or 'none'}")
        a(f"  Fear Cues     : {', '.join(po.get('fear_cues', [])) or 'none'}")
        a(f"  Persuasion    : {', '.join(po.get('visual_persuasion', [])) or 'none'}")
        a(f"  Propaganda    : {', '.join(po.get('propaganda_elements', [])) or 'none'}")
        a(f"  Confidence    : {vc}")
    else:
        section_num = 2
        if input_type != "image":
            a("\n2. VISION ANALYSIS")
            a(_LINE)
            a("  N/A — text input")

    # ── 3. RoBERTa Analysis ───────────────────────────────────────────────
    a("\n3. ROBERTA ANALYSIS")
    a(_LINE)
    a(f"  Label         : {roberta.get('label', 'N/A')}")
    a(f"  Confidence    : {roberta.get('confidence', 0.0)*100:.2f}%")
    probs = roberta.get("probabilities") or roberta.get("all_scores") or roberta.get("scores")
    if probs and isinstance(probs, dict):
        a("  Probabilities :")
        for lbl, prob in probs.items():
            a(f"    {lbl:<28}: {prob*100:.2f}%")

    # ── 4. Emotion Analysis ───────────────────────────────────────────────
    a("\n4. EMOTION ANALYSIS")
    a(_LINE)
    a(f"  Primary Emotion : {emotion_out.get('primary_emotion', 'N/A').capitalize()}")
    a(f"  Confidence      : {emotion_out.get('confidence', 0.0)*100:.2f}%")
    all_emotions = emotion_out.get("all_emotions", {})
    if all_emotions:
        a("  All Emotions    :")
        for emo, score in sorted(all_emotions.items(), key=lambda x: -x[1]):
            a(f"    {emo:<28}: {score*100:.2f}%")

    # ── 5. Specialized Agent Results ─────────────────────────────────────
    a("\n5. SPECIALIZED AGENT RESULTS")
    a(_LINE)
    agent_display_names = {
        "intent":               "Intent Agent",
        "vulnerability":        "Vulnerability Agent",
        "emotion_exploitation": "Emotion Exploitation Agent",
        "strategy":             "Strategy Agent",
        "context":              "Context Agent",
        "motive":               "Motive Agent",
        "bias":                 "Bias Agent",
        "relationship":         "Relationship Agent",
    }
    for key, display in agent_display_names.items():
        r = agents.get(key, {})
        a(f"\n  [{display}]")
        if "error" in r:
            a(f"    Status    : ERROR — {r['error']}")
            continue
        a(f"    Label     : {r.get('label', 'N/A')}")
        a(f"    Confidence: {r.get('confidence', 0.0)*100:.1f}%")
        reasoning = r.get("reasoning", "")
        if reasoning:
            a(f"    Reasoning : {reasoning[:200]}{'...' if len(reasoning) > 200 else ''}")
        evidence = r.get("evidence", [])
        if evidence:
            a(f"    Evidence  : {'; '.join(str(e) for e in evidence[:3])}")

    # ── 6. Judge Decision ─────────────────────────────────────────────────
    a("\n6. JUDGE DECISION")
    a(_LINE)
    a(f"  Decision      : {judge.get('decision', 'N/A')}")
    a(f"  Confidence    : {judge.get('confidence', 0.0)*100:.1f}%")
    j_reasoning = judge.get("reasoning", "")
    if j_reasoning:
        a(f"  Reasoning     : {j_reasoning[:300]}{'...' if len(j_reasoning) > 300 else ''}")
    j_evidence = judge.get("evidence", [])
    if j_evidence:
        a(f"  Evidence      : {'; '.join(str(e) for e in j_evidence[:3])}")
    if judge.get("summary"):
        a(f"  Summary       : {judge['summary']}")

    # ── 7. Meta Judge ─────────────────────────────────────────────────────
    a("\n7. META JUDGE  (Final Authority)")
    a(_LINE)
    a(f"  Final Decision    : {meta.get('final_decision', 'N/A')}")
    a(f"  Confidence        : {meta.get('confidence', 0.0)*100:.1f}%")
    a(f"  Agreement Score   : {meta.get('agreement_score', 0.0):.2f}")
    conflicting = meta.get("conflicting_agents", [])
    a(f"  Conflicting Agents: {', '.join(conflicting) if conflicting else 'none'}")
    m_reasoning = meta.get("reasoning", "")
    if m_reasoning:
        a(f"  Reasoning         : {m_reasoning[:300]}{'...' if len(m_reasoning) > 300 else ''}")
    if meta.get("final_summary"):
        a(f"  Final Summary     : {meta['final_summary']}")

    # ── 8. Overall Risk Assessment ────────────────────────────────────────
    a("\n8. OVERALL RISK ASSESSMENT")
    a(_LINE)
    risk = _risk_level(meta.get("final_decision", ""), meta.get("confidence", 0.0))
    a(f"  Risk Level    : {risk}")

    # ── 9. Executive Summary ──────────────────────────────────────────────
    a("\n9. EXECUTIVE SUMMARY")
    a(_LINE)
    for line in _executive_summary(analysis).split("\n"):
        a(f"  {line}")

    a(f"\n{_DIV}")
    a("              END OF REPORT")
    a(_DIV)

    return "\n".join(parts)


# ---------------------------------------------------------------------------
# JSON formatter
# ---------------------------------------------------------------------------

def _fmt_json(analysis: Dict[str, Any]) -> Dict[str, Any]:
    meta        = analysis.get("meta_judge", {})
    judge       = analysis.get("judge", {})
    roberta     = analysis.get("roberta_output", {})
    emotion_out = analysis.get("emotion_output", {})
    agents      = analysis.get("agents", {})
    vision_out  = analysis.get("vision_output")

    return {
        "input": {
            "type": analysis.get("input_type"),
            "text_analyzed": analysis.get("text_analyzed"),
        },
        "vision": vision_out,
        "roberta": {
            "label":      roberta.get("label"),
            "confidence": roberta.get("confidence"),
        },
        "emotion": {
            "primary_emotion": emotion_out.get("primary_emotion"),
            "confidence":      emotion_out.get("confidence"),
            "all_emotions":    emotion_out.get("all_emotions", {}),
        },
        "agents": {
            k: {
                "label":      v.get("label"),
                "confidence": v.get("confidence"),
                "reasoning":  v.get("reasoning"),
                "evidence":   v.get("evidence", []),
            }
            for k, v in agents.items()
        },
        "judge": {
            "decision":   judge.get("decision"),
            "confidence": judge.get("confidence"),
            "reasoning":  judge.get("reasoning"),
            "evidence":   judge.get("evidence", []),
            "summary":    judge.get("summary"),
        },
        "meta_judge": {
            "final_decision":    meta.get("final_decision"),
            "confidence":        meta.get("confidence"),
            "agreement_score":   meta.get("agreement_score"),
            "conflicting_agents": meta.get("conflicting_agents", []),
            "reasoning":         meta.get("reasoning"),
            "final_summary":     meta.get("final_summary"),
        },
        "risk_level":       _risk_level(meta.get("final_decision", ""), meta.get("confidence", 0.0)),
        "executive_summary": _executive_summary(analysis),
    }


# ---------------------------------------------------------------------------
# HTML placeholder
# ---------------------------------------------------------------------------

def _fmt_html(analysis: Dict[str, Any]) -> str:
    """HTML export — placeholder for future implementation."""
    raise NotImplementedError("HTML report export is not yet implemented.")


# ---------------------------------------------------------------------------
# PDF placeholder
# ---------------------------------------------------------------------------

def _fmt_pdf(analysis: Dict[str, Any], output_path: str) -> None:
    """PDF export — placeholder for future implementation."""
    raise NotImplementedError("PDF report export is not yet implemented.")


# ---------------------------------------------------------------------------
# Public interface
# ---------------------------------------------------------------------------

def generate_report(analysis: Dict[str, Any], fmt: str = "console") -> Any:
    """
    Generate the Explainable Manipulation Report from the shared analysis dictionary.

    Parameters
    ----------
    analysis : dict
        The complete shared analysis dictionary returned by the orchestrator.
    fmt : str
        Output format. One of: 'console' (default), 'json', 'html', 'pdf'.

    Returns
    -------
    str | dict
        Formatted report string (console/html) or structured dict (json).
        Also stores the console report in analysis['report'].
    """
    print()
    print("=" * 52)
    print("         REPORT GENERATOR")
    print("=" * 52)

    t0 = time.perf_counter()

    print("  Formatting sections...")
    console_report = _fmt_console(analysis)

    print("  Generating executive summary...")
    # Already embedded in _fmt_console; confirm it's present
    analysis["report"] = console_report

    elapsed = time.perf_counter() - t0
    print(f"  Execution Time : {elapsed:.3f}s")
    print("=" * 52)
    print()

    if fmt == "console":
        return console_report
    if fmt == "json":
        return _fmt_json(analysis)
    if fmt == "html":
        return _fmt_html(analysis)
    if fmt == "pdf":
        raise NotImplementedError("PDF report export is not yet implemented.")

    raise ValueError(f"Unknown report format: '{fmt}'. Choose from: console, json, html, pdf.")
