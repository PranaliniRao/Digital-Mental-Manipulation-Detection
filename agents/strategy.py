from typing import List
from .base import BaseAgent
from .prompts import STRATEGY_SYSTEM_PROMPT, STRATEGY_USER_PROMPT

class StrategyAgent(BaseAgent):
    """
    Agent responsible for determining HOW manipulation is happening.
    """

    def __init__(self):
        super().__init__(
            agent_name="Strategy Agent",
            system_prompt_template=STRATEGY_SYSTEM_PROMPT,
            user_prompt_template=STRATEGY_USER_PROMPT
        )

    def get_labels(self) -> List[str]:
        return [
            "guilt tripping",
            "gaslighting",
            "authority bias",
            "scarcity",
            "reciprocity",
            "social proof",
            "emotional blackmail",
            "urgency tactics",
            "none"
        ]
