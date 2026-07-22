from typing import List
from .base import BaseAgent
from .prompts import INTENT_SYSTEM_PROMPT, INTENT_USER_PROMPT

class IntentAgent(BaseAgent):
    """
    Agent responsible for determining WHY the speaker is saying something.
    """

    def __init__(self):
        super().__init__(
            agent_name="Intent Agent",
            system_prompt_template=INTENT_SYSTEM_PROMPT,
            user_prompt_template=INTENT_USER_PROMPT
        )

    def get_labels(self) -> List[str]:
        return [
            "persuasion",
            "dependency creation",
            "emotional coercion",
            "fear induction",
            "financial manipulation",
            "social isolation",
            "none"
        ]
