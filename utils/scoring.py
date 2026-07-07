print("***** NEW SCORING.PY LOADED *****")
INTENT_WEIGHTS = {
    "Persuasion": 0.20,
    "Emotional Dependency": 0.20,
    "Fear Induction": 0.20,
    "Authority Influence": 0.20,
    "Guilt Induction": 0.20,
    "None": 0.0,
}

VULNERABILITY_WEIGHTS = {
    "Loneliness": 0.15,
    "Fear": 0.15,
    "Insecurity": 0.15,
    "Need for Approval": 0.15,
    "FOMO": 0.15,
    "Trust in Authority": 0.15,
    "Financial Stress": 0.10,
    "None": 0.0,
}

SEVERITY_VALUES = {
    "None": 0.0,
    "Low": 33.3,
    "Medium": 66.6,
    "High": 100.0,
}

BIAS_WEIGHTS = {
    "Authority Bias": 0.125,
    "Scarcity Bias": 0.125,
    "Loss Aversion": 0.125,
    "Reciprocity": 0.125,
    "Social Proof": 0.125,
    "Commitment & Consistency": 0.125,
    "Confirmation Bias": 0.125,
    "FOMO": 0.125,
    "None": 0.0,
}

INFLUENCE_WEIGHTS = {
    "Fear Appeal": 0.142857,
    "Scarcity": 0.142857,
    "Guilt Tripping": 0.142857,
    "Emotional Blackmail": 0.142857,
    "Social Proof": 0.142857,
    "Isolation": 0.142857,
    "Authority Bias": 0.142857,
    "None": 0.0,
}

COMPONENT_WEIGHTS = {
    "Intent": 0.25,
    "Vulnerability": 0.35,
    "Cognitive Bias": 0.20,
    "Influence Strategy": 0.20,
}


def clamp_score(value, min_value: float = 0.0, max_value: float = 100.0) -> float:
    try:
        normalized = float(value)
    except (TypeError, ValueError):
        return min_value
    return max(min_value, min(normalized, max_value))


def normalize_component(
    items,
    weight_map,
    key_name,
    score_field="confidence",
    severity_map=None,
):
    unique = {}

    for item in items:
        key = item.get(key_name)
        if key is None:
            continue

        if severity_map is not None:
            raw_value = item.get(score_field, "None")
            value = severity_map.get(raw_value, 0.0)
        else:
            value = clamp_score(item.get(score_field, 0))

        if key not in unique or value > unique[key]["_normalized_value"]:
            record = dict(item)
            record["_normalized_value"] = value
            unique[key] = record

    total_weight = sum(weight_map.get(key, 0.0) for key in unique)
    if total_weight <= 0:
        return 0.0

    weighted_value = sum(
        weight_map.get(key, 0.0) * item["_normalized_value"]
        for key, item in unique.items()
    )

    return clamp_score(weighted_value / total_weight)


def calculate_manipulation_risk(
    intent_analysis,
    vulnerability_analysis,
    bias_analysis,
    influence_analysis,
):
    """
    Computes a Psychological Manipulation Risk Score (0-100)
    """

    intent_score = normalize_component(
        intent_analysis.get("intents_detected", []),
        INTENT_WEIGHTS,
        key_name="intent",
        score_field="confidence",
    )

    vulnerability_score = normalize_component(
        vulnerability_analysis.get("vulnerabilities_targeted", []),
        VULNERABILITY_WEIGHTS,
        key_name="vulnerability",
        score_field="severity",
        severity_map=SEVERITY_VALUES,
    )

    bias_score = normalize_component(
        bias_analysis.get("detected_biases", []),
        BIAS_WEIGHTS,
        key_name="bias",
        score_field="confidence",
    )

    influence_score = normalize_component(
        influence_analysis.get("strategies_identified", []),
        INFLUENCE_WEIGHTS,
        key_name="strategy",
        score_field="confidence",
    )

    weighted_intent = COMPONENT_WEIGHTS["Intent"] * intent_score
    weighted_vuln = COMPONENT_WEIGHTS["Vulnerability"] * vulnerability_score
    weighted_bias = COMPONENT_WEIGHTS["Cognitive Bias"] * bias_score
    weighted_influence = COMPONENT_WEIGHTS["Influence Strategy"] * influence_score

    total_score = (
        weighted_intent
        + weighted_vuln
        + weighted_bias
        + weighted_influence
    )
    total_score = clamp_score(total_score)

    if total_score < 35:
        risk_level = "Low"
    elif total_score < 70:
        risk_level = "Medium"
    else:
        risk_level = "High"

    explanation = f"""
Psychological Manipulation Risk Score: {total_score:.1f}/100

Intent Score: {intent_score:.1f}
Weighted Contribution: {weighted_intent:.1f}

Vulnerability Score: {vulnerability_score:.1f}
Weighted Contribution: {weighted_vuln:.1f}

Bias Score: {bias_score:.1f}
Weighted Contribution: {weighted_bias:.1f}

Influence Score: {influence_score:.1f}
Weighted Contribution: {weighted_influence:.1f}

Final Formula

0.25×{intent_score:.1f}
+
0.35×{vulnerability_score:.1f}
+
0.20×{bias_score:.1f}
+
0.20×{influence_score:.1f}

=

{total_score:.1f}
"""

    return {
        "component_scores": {
            "Intent": round(intent_score, 1),
            "Vulnerability": round(vulnerability_score, 1),
            "Cognitive Bias": round(bias_score, 1),
            "Influence Strategy": round(influence_score, 1),
        },
        "weighted_contributions": {
            "Intent": round(weighted_intent, 1),
            "Vulnerability": round(weighted_vuln, 1),
            "Cognitive Bias": round(weighted_bias, 1),
            "Influence Strategy": round(weighted_influence, 1),
        },
        "total_risk_score": round(total_score, 1),
        "risk_level": risk_level,
        "explanation": explanation,
    }
