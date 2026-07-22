from typing import List
from .base import BaseAgent
from .prompts import MOTIVE_SYSTEM_PROMPT, MOTIVE_USER_PROMPT

class MotiveAgent(BaseAgent):
    """
    Agent responsible for determining what the manipulator gains.
    """

    def __init__(self):
        super().__init__(
            agent_name="Motive Agent",
            system_prompt_template=MOTIVE_SYSTEM_PROMPT,
            user_prompt_template=MOTIVE_USER_PROMPT
        )

    def get_labels(self) -> List[str]:
        return [
            "money",
            "control",
            "attention",
            "dependency",
            "information",
            "obedience",
            "none"
        ]

