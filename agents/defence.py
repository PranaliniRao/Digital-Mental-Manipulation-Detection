import json
from typing import List, Dict, Any
from .base import BaseAgent

# Prompt templates defined locally to keep code clean and self-contained
DEFENCE_SYSTEM_PROMPT = """You are the Defence Agent in a digital mental manipulation detection system.
You are a psychological defence and resilience expert.
Your role is NOT to detect manipulation, but to recommend safe responses and protective strategies against already detected manipulation.

Based on the provided manipulation indicators, you must determine:
1. Threat category
2. Immediate risk level ("low", "medium", "high")
3. Confidence score (0.0 to 1.0)

Then provide exactly 5 defensive segments with SHORT, scannable content (max 1 sentence per bullet/item):
- protective_actions: array of short, actionable strings (immediate steps the user can take right now)
- communication_boundaries: array of short strings (boundaries/scripts the user can set with the manipulator)
- manipulation_education: short string or 2-3 bullet points explaining the specific manipulation technique(s) detected, in plain language
- counter_strategies: array of short strings (proactive tactics to neutralize/respond to the manipulation)
- escalation_recommendation: object with needed (boolean), reason (short string only if needed=true), suggested_action (short string only if needed=true)

Allowed Threat Categories (Labels):
- emotional manipulation
- social engineering
- fear tactics
- propaganda
- dependency creation
- none

You MUST respond with a single, valid JSON object and nothing else. No explanation before or after the JSON.
Keep all items SHORT and scannable — not paragraphs. This is a dashboard display, not a detailed report.
The JSON must follow this schema exactly:
{
    "agent_name": "Defence Agent",
    "threat_category": "string (one of the threat categories)",
    "risk_level": "string (low|medium|high)",
    "confidence": float (confidence score between 0.0 and 1.0),
    "protective_actions": [
        "string array of short, actionable immediate steps (max 1 sentence each)"
    ],
    "communication_boundaries": [
        "string array of short boundary scripts (max 1 sentence each)"
    ],
    "manipulation_education": "string or 2-3 bullet points explaining the manipulation technique in plain language",
    "counter_strategies": [
        "string array of short proactive tactics (max 1 sentence each)"
    ],
    "escalation_recommendation": {
        "needed": boolean,
        "reason": "short string (only if needed=true)",
        "suggested_action": "short string (only if needed=true, e.g. 'report to platform', 'contact a trusted adult', 'involve authorities')"
    }
}
"""

DEFENCE_USER_PROMPT = """Analyze the following shared analysis data containing detected manipulation indicators:
---
Shared Analysis Dictionary:
{agent_findings}
---
Analyze the text: "{text}"

Select one threat category label from: {labels}.
Generate appropriate defensive recommendations and fill in the JSON template exactly.
"""


class DefenceAgent(BaseAgent):
    """
    Agent responsible for generating defensive recommendations, protective actions,
    coping strategies, verification steps, boundary suggestions, and safety advice
    based on detected manipulation.
    """

    def __init__(self):
        super().__init__(
            agent_name="Defence Agent",
            system_prompt_template=DEFENCE_SYSTEM_PROMPT,
            user_prompt_template=DEFENCE_USER_PROMPT
        )

    def get_labels(self) -> List[str]:
        return [
            "emotional manipulation",
            "social engineering",
            "fear tactics",
            "propaganda",
            "dependency creation",
            "none"
        ]

    def parse_response(self, response_text: str) -> Dict[str, Any]:
        """
        Parses the raw model output text and returns a standardized JSON structure
        with the new 5-segment defensive structure.
        """
        cleaned = response_text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        # Failsafe standard response fallback with new structure
        standard_response = {
            "agent_name": self.agent_name,
            "threat_category": "none",
            "risk_level": "low",
            "confidence": 0.0,
            "protective_actions": [],
            "communication_boundaries": [],
            "manipulation_education": "Defensive analysis unavailable.",
            "counter_strategies": [],
            "escalation_recommendation": {
                "needed": False,
                "reason": "",
                "suggested_action": ""
            }
        }

        try:
            data = json.loads(cleaned)
            
            # Parse summary fields
            standard_response["threat_category"] = str(data.get("threat_category", "none"))
            standard_response["confidence"] = float(data.get("confidence", 0.0))
            
            risk_lvl = str(data.get("risk_level", "low")).lower().strip()
            if risk_lvl not in ["low", "medium", "high"]:
                risk_lvl = "low"
            standard_response["risk_level"] = risk_lvl
            
            # Parse 5 defensive segments
            for key in ["protective_actions", "communication_boundaries", "counter_strategies"]:
                val = data.get(key, [])
                if isinstance(val, list):
                    standard_response[key] = [str(item) for item in val]
                elif isinstance(val, str):
                    standard_response[key] = [val]
                else:
                    standard_response[key] = []
            
            standard_response["manipulation_education"] = str(data.get("manipulation_education", ""))
            
            # Parse escalation_recommendation object
            esc = data.get("escalation_recommendation", {})
            if isinstance(esc, dict):
                standard_response["escalation_recommendation"] = {
                    "needed": bool(esc.get("needed", False)),
                    "reason": str(esc.get("reason", "")),
                    "suggested_action": str(esc.get("suggested_action", ""))
                }

        except (json.JSONDecodeError, ValueError, TypeError) as e:
            # Failsafe requirement: Do not throw exceptions, return fallback
            standard_response["manipulation_education"] = f"Parsing error: {str(e)}. Raw response: {response_text[:200]}..."

        return standard_response

    def analyze(self, analysis: Any, **kwargs) -> Dict[str, Any]:
        """
        Orchestrates prompt creation, model invocation, and response parsing.
        Accepts the shared analysis dictionary or a text string.
        """
        if isinstance(analysis, str):
            # Wrap raw string input in a compatible dictionary to ensure robust single-agent testing
            analysis_dict = {
                "text_analyzed": analysis,
                "roberta_output": {"label": "manipulative", "confidence": 0.5},
                "emotion_output": {"primary_emotion": "neutral", "confidence": 0.5, "all_emotions": {}},
                "agents": {},
                "judge": {"decision": "manipulation", "confidence": 0.5}
            }
            text_val = analysis
        elif isinstance(analysis, dict):
            analysis_dict = analysis
            text_val = str(analysis_dict.get("text_analyzed", ""))
        else:
            raise TypeError("DefenceAgent.analyze expects a string or the shared analysis dictionary.")

        system_prompt, user_prompt = self.build_prompt_parts(
            text=text_val,
            agent_findings=json.dumps(analysis_dict, ensure_ascii=False, indent=2, default=str),
            **kwargs
        )

        parsed: Dict[str, Any] = {}
        for attempt in range(1, 3):
            raw_response = self.call_llm(user_prompt, system_prompt=system_prompt)
            parsed = self.parse_response(raw_response)
            
            # If we got a valid threat_category (not the "none" default fallback), we break
            if parsed.get("threat_category", "none") != "none":
                break
                
            if attempt == 1:
                print(f"[{self.agent_name}] JSON parse failed, retrying...")

        return parsed
