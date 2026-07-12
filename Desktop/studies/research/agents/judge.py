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
