from pydantic import BaseModel, Field
from typing import List, Literal
from agents.base import BaseAgent
from utils.llm import GeminiClient

class IdentifiedStrategy(BaseModel):
    strategy: Literal["Fear Appeal", "Scarcity", "Guilt Tripping", "Emotional Blackmail", "Social Proof", "Isolation", "Authority Bias", "None"] = Field(
        description="The identified influence/manipulation strategy from the list."
    )
    confidence: int = Field(
        default=0,
        description="Confidence level for this strategy detection (0-100).",
        ge=0,
        le=100,
    )
    evidence: str = Field(
        description="Specific direct quote or snippet from the text illustrating this strategy."
    )
    explanation: str = Field(
        description="Explanation of how this strategy is applied in the context of the text."
    )

class InfluenceAnalysis(BaseModel):
    strategies_identified: List[IdentifiedStrategy] = Field(
        description="List of influence or manipulation strategies identified in the text."
    )
    manipulation_tactics_count: int = Field(
        description="Total count of active manipulation tactics identified.",
        ge=0
    )
    subtlety_level: Literal["Low", "Medium", "High", "None"] = Field(
        description="How subtle or overt the manipulation tactics are (Low means very overt/obvious, High means very hidden/subtle)."
    )

class InfluenceStrategyAnalyzerAgent(BaseAgent):
    def __init__(self, client: GeminiClient):
        super().__init__(name="Influence Strategy Analyzer", client=client)
        self.system_instruction = (
            "You are an expert in social influence, persuasion architecture, and propaganda analysis.\n"
            "Your task is to identify the influence strategies and manipulation techniques present in the provided text.\n"
            "Map the techniques to the following categories:\n"
            "1. Fear Appeal: Attempting to influence behavior by threatening alarm, physical/social harm, or emphasizing dire consequences.\n"
            "2. Scarcity: Creating artificial urgency, limited time, high exclusivity, or restricted supply (e.g., 'only 2 hours left!', 'exclusive group').\n"
            "3. Guilt Tripping: Inducing feelings of personal moral failure, obligation, regret, or self-blame to coerce action.\n"
            "4. Emotional Blackmail: Using relationship threats, passive aggression, emotional pain, or conditional support if demands are not met.\n"
            "5. Social Proof: Using testimonials, claims that 'everyone else is doing it', or collective validation to force conformity.\n"
            "6. Isolation: Discouraging contact with support networks, friends, family, or independent advisors (e.g., 'don't tell anyone', 'they won't understand').\n"
            "7. Authority Bias: Leveraging real or fake institutional authority, expert titles, certifications, legal threats, or official rules to force compliance.\n\n"
            "Analyze the text, find specific evidence for each detected strategy, count the tactics used, rate your confidence for each strategy on a 0-100 scale, and rate the subtlety level (Low/Medium/High/None)."
        )

    def analyze_text(self, text: str, model: str = "gemini-2.5-flash") -> InfluenceAnalysis:
        prompt = f"Analyze the following text to identify influence strategies and manipulation techniques:\n\n---\n{text}\n---\n"
        return self.analyze(
            prompt=prompt,
            response_schema=InfluenceAnalysis,
            model=model,
            system_instruction=self.system_instruction
        )