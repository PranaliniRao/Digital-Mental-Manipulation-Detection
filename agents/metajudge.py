import json
from typing import Any, Dict, List
from .base import BaseAgent
from .prompts import META_JUDGE_SYSTEM_PROMPT, META_JUDGE_USER_PROMPT

# Labels that specialized agents use to signal manipulation is present
_MANIPULATION_LABELS = {
    "persuasion", "dependency creation", "emotional coercion", "fear induction",
    "financial manipulation", "social isolation",          # intent
    "loneliness", "fear", "insecurity", "low self esteem",
    "need for approval", "fomo", "grief", "guilt",         # vulnerability
    "anger", "shame", "hope", "empathy", "pride",          # emotion exploitation
    "guilt tripping", "gaslighting", "authority bias", "scarcity",
    "reciprocity", "social proof", "emotional blackmail", "urgency tactics",  # strategy
    "suspicious / adversarial",                            # context
    "money", "control", "attention", "dependency",
    "information", "obedience",                            # motive
    "authority bias", "confirmation bias", "scarcity bias",
    "reciprocity bias", "bandwagon effect",                # bias
    "manipulation",                                        # judge / roberta
}

_BENIGN_LABELS = {"none", "no_manipulation", "formal / standard communication",
                  "genuine concern", "support message", "humour", "sarcasm",
                  "romantic conversation", "parent-child conversation",
                  "peer / friend", "unknown"}


def _is_manipulative_label(label: str) -> bool:
    return label.lower().strip() in _MANIPULATION_LABELS


class MetaJudgeAgent(BaseAgent):
    """
    MetaJudgeAgent is the final decision authority.
    It receives the complete shared analysis dictionary and resolves conflicts
    between agents, RoBERTa, Emotion, and the Judge.
    It never calls any service or agent.
    """

    def __init__(self):
        super().__init__(
            agent_name="Meta Judge Agent",
            system_prompt_template=META_JUDGE_SYSTEM_PROMPT,
            user_prompt_template=META_JUDGE_USER_PROMPT,
        )

    def get_labels(self) -> List[str]:
        return ["manipulation", "no_manipulation"]

    def parse_response(self, response_text: str) -> Dict[str, Any]:
        """
        Override base parser to handle Meta Judge specific fields:
        agreement_score, conflicting_agents
        """
        cleaned = response_text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        standard_response = {
            "agent_name": self.agent_name,
            "label": "Unknown",
            "confidence": 0.0,
            "reasoning": "Failed to parse model response.",
            "evidence": [],
            "risk_contribution": 0.0,
            "agreement_score": 0.0,
            "conflicting_agents": [],
        }

        try:
            data = json.loads(cleaned)
            standard_response["label"] = str(data.get("label", "Unknown"))
            standard_response["confidence"] = float(data.get("confidence", 0.0))
            standard_response["reasoning"] = str(data.get("reasoning", ""))
            
            evidence = data.get("evidence", [])
            if isinstance(evidence, list):
                standard_response["evidence"] = [str(item) for item in evidence]
            elif isinstance(evidence, str):
                standard_response["evidence"] = [evidence]
                
            standard_response["risk_contribution"] = float(data.get("risk_contribution", 0.0))
            
            # Meta Judge specific fields
            standard_response["final_decision"] = str(data.get("label", "Unknown"))
            standard_response["agreement_score"] = float(data.get("agreement_score", 0.0))
            
            conflicting = data.get("conflicting_agents", [])
            if isinstance(conflicting, list):
                standard_response["conflicting_agents"] = [str(item) for item in conflicting]
            else:
                standard_response["conflicting_agents"] = []
                
        except (json.JSONDecodeError, ValueError, TypeError) as e:
            standard_response["reasoning"] = f"Parsing error: {str(e)}. Raw response: {response_text}"
            
        return standard_response

    # ------------------------------------------------------------------
    # Pre-LLM conflict detection (deterministic, fast)
    # ------------------------------------------------------------------

    def _compute_agreement(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Deterministically compute:
        - signals: list of (source_name, is_manipulative)
        - agreement_score: fraction of signals that agree with the majority
        - conflicting_agents: names of sources that disagree with the majority
        """
        signals: List[tuple[str, bool]] = []

        # RoBERTa
        roberta = analysis.get("roberta_output", {})
        if roberta.get("label"):
            signals.append(("RoBERTa", _is_manipulative_label(roberta["label"])))

        # Emotion — treat non-neutral primary emotion as a weak manipulation signal
        emotion = analysis.get("emotion_output", {})
        primary = emotion.get("primary_emotion", "neutral")
        signals.append(("Emotion", primary.lower() not in ("neutral", "joy", "surprise")))

        # Judge
        judge = analysis.get("judge", {})
        if judge.get("decision"):
            signals.append(("Judge", _is_manipulative_label(judge["decision"])))

        # Specialized agents
        for agent_key, agent_result in analysis.get("agents", {}).items():
            label = agent_result.get("label", "")
            if label and label.lower() not in ("error", "unknown", ""):
                signals.append((agent_key, _is_manipulative_label(label)))

        if not signals:
            return {"agreement_score": 0.0, "conflicting_agents": [], "majority_manipulative": False}

        manip_count = sum(1 for _, v in signals if v)
        benign_count = len(signals) - manip_count
        majority_manipulative = manip_count >= benign_count

        majority_count = max(manip_count, benign_count)
        agreement_score = round(majority_count / len(signals), 3)

        conflicting_agents = [
            name for name, is_manip in signals
            if is_manip != majority_manipulative
        ]

        return {
            "agreement_score": agreement_score,
            "conflicting_agents": conflicting_agents,
            "majority_manipulative": majority_manipulative,
        }

    # ------------------------------------------------------------------
    # Public interface
    # ------------------------------------------------------------------

    def analyze(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Produce the final decision from the completed shared analysis dictionary.
        Never calls any service, model, or agent.
        """
        if not isinstance(analysis, dict):
            raise TypeError("MetaJudgeAgent.analyze expects the shared analysis dictionary.")

        pre = self._compute_agreement(analysis)

        system_prompt, user_prompt = self.build_prompt_parts(
            text=str(analysis.get("text_analyzed", "")),
            agent_findings=json.dumps(analysis, ensure_ascii=False, indent=2, default=str),
        )

        parsed: Dict[str, Any] = {}
        for attempt in range(1, 3):
            parsed = self.parse_response(self.call_llm(user_prompt, system_prompt=system_prompt))
            if parsed.get("label") in self.get_labels():
                break
            if attempt == 1:
                print(f"[{self.agent_name}] JSON parse failed, retrying...")

        # Use the parsed fields directly from our custom parser
        final_label = parsed.get("final_decision") or parsed.get("label")
        if final_label not in self.get_labels():
            final_label = "manipulation" if pre["majority_manipulative"] else "no_manipulation"

        confidence = parsed.get("confidence", 0.0)
        agreement_score = parsed.get("agreement_score", pre["agreement_score"])
        conflicting_agents = parsed.get("conflicting_agents", pre["conflicting_agents"])

        return {
            "final_decision": final_label,
            "confidence": confidence,
            "agreement_score": agreement_score,
            "conflicting_agents": conflicting_agents,
            "reasoning": parsed.get("reasoning", "Meta Judge could not produce reasoning."),
            "final_summary": (
                f"Meta Judge final decision: {final_label} "
                f"({confidence * 100:.1f}% confidence, "
                f"agreement score: {agreement_score:.2f})."
            ),
        }
