import json
from typing import List, Dict, Any
from .base import BaseAgent
from .prompts import JUDGE_SYSTEM_PROMPT, JUDGE_USER_PROMPT

class JudgeAgent(BaseAgent):
    """
    JudgeAgent combines evidence from all specialty reasoning agents and calculates
    an overall manipulation decision and confidence score.
    """

    def __init__(self):
        super().__init__(
            agent_name="Judge Agent",
            system_prompt_template=JUDGE_SYSTEM_PROMPT,
            user_prompt_template=JUDGE_USER_PROMPT
        )

    def get_labels(self) -> List[str]:
        return [
            "manipulation",
            "no_manipulation"
        ]

    def analyze(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Produce one decision from the already-completed shared analysis.

        The Judge deliberately receives no raw service or agent objects.  Its only
        input is the shared analysis dictionary assembled by the orchestrator.
        """
        if not isinstance(analysis, dict):
            raise TypeError("JudgeAgent.analyze expects the shared analysis dictionary.")

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

        return {
            "decision": parsed.get("label", "no_manipulation"),
            "confidence": parsed.get("confidence", 0.0),
            "reasoning": parsed.get("reasoning", "Failed to produce a judge decision."),
            "evidence": parsed.get("evidence", []),
            "summary": (
                f"Judge decision: {parsed.get('label', 'no_manipulation')} "
                f"({parsed.get('confidence', 0.0) * 100:.1f}% confidence)."
            ),
        }
