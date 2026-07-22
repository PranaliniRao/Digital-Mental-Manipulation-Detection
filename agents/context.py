from typing import List
from .base import BaseAgent
from .prompts import CONTEXT_SYSTEM_PROMPT, CONTEXT_USER_PROMPT

class ContextAgent(BaseAgent):
    """
    Agent responsible for determining contextual meaning to reduce false positives.
    """

    def __init__(self):
        super().__init__(
            agent_name="Context Agent",
            system_prompt_template=CONTEXT_SYSTEM_PROMPT,
            user_prompt_template=CONTEXT_USER_PROMPT
        )

    def get_labels(self) -> List[str]:
        return [
            "sarcasm",
            "humour",
            "romantic conversation",
            "parent-child conversation",
            "support message",
            "genuine concern",
            "formal / standard communication",
            "suspicious / adversarial"
        ]
