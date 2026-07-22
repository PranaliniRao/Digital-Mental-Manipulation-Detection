from typing import List
from .base import BaseAgent
from .prompts import BIAS_SYSTEM_PROMPT, BIAS_USER_PROMPT

class BiasAgent(BaseAgent):
    """
    Agent responsible for determining cognitive biases being exploited.
    """

    def __init__(self):
        super().__init__(
            agent_name="Bias Agent",
            system_prompt_template=BIAS_SYSTEM_PROMPT,
            user_prompt_template=BIAS_USER_PROMPT
        )

    def get_labels(self) -> List[str]:
        return [
            "authority bias",
            "confirmation bias",
            "scarcity bias",
            "reciprocity bias",
            "bandwagon effect",
            "none"
        ]
