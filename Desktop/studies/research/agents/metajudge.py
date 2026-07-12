from typing import List
from .base import BaseAgent
from .prompts import META_JUDGE_SYSTEM_PROMPT, META_JUDGE_USER_PROMPT

class MetaJudgeAgent(BaseAgent):
    """
    MetaJudgeAgent reviews uncertain cases, resolves conflicts, and acts as the final
    arbitration layer to reduce false positives.
    """

    def __init__(self):
        super().__init__(
            agent_name="Meta Judge Agent",
            system_prompt_template=META_JUDGE_SYSTEM_PROMPT,
            user_prompt_template=META_JUDGE_USER_PROMPT
        )

    def get_labels(self) -> List[str]:
        return [
            "manipulation",
            "no_manipulation"
        ]
