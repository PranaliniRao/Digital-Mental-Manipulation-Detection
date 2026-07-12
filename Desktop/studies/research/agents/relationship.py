from typing import List
from .base import BaseAgent
from .prompts import RELATIONSHIP_SYSTEM_PROMPT, RELATIONSHIP_USER_PROMPT

class RelationshipAgent(BaseAgent):
    """
    Agent responsible for determining interpersonal dynamics.
    """

    def __init__(self):
        super().__init__(
            agent_name="Relationship Agent",
            system_prompt_template=RELATIONSHIP_SYSTEM_PROMPT,
            user_prompt_template=RELATIONSHIP_USER_PROMPT
        )

    def get_labels(self) -> List[str]:
        return [
            "romantic partner",
            "stranger",
            "authority figure",
            "family member",
            "influencer-follower",
            "employer-employee",
            "peer / friend",
            "unknown"
        ]

