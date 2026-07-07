from pydantic import BaseModel, Field
from typing import List, Literal
from agents.base import BaseAgent
from utils.llm import GeminiClient

class DetectedIntent(BaseModel):
    intent: Literal["Persuasion", "Emotional Dependency", "Fear Induction", "Authority Influence", "Guilt Induction", "None"] = Field(
        description="The identified intent category from the list."
    )
    confidence: int = Field(
        description="Confidence score for this detection (0-100).",
        ge=0,
        le=100
    )

class IntentAnalysis(BaseModel):
    primary_intent: Literal["Persuasion", "Emotional Dependency", "Fear Induction", "Authority Influence", "Guilt Induction", "None"] = Field(
        description="The main, most dominant intent identified in the text."
    )
    intents_detected: List[DetectedIntent] = Field(
        description="List of all detected intents from the pre-defined list along with confidence scores."
    )
    evidence: List[str] = Field(
        description="Direct quotes or snippets from the text supporting the identified intents."
    )
    reasoning: str = Field(
        description="Detailed analytical reasoning explaining why the intent was identified."
    )

class IntentAnalyzerAgent(BaseAgent):
    def __init__(self, client: GeminiClient):
        super().__init__(name="Intent Analyzer", client=client)
        self.system_instruction = (
            "You are an expert psychological linguist and forensics analyst specializing in digital manipulation.\n"
            "Your task is to analyze the speaker's intent in the provided text.\n"
            "You must categorize the intents according to the following definitions:\n"
            "1. Persuasion: Attempting to convince the recipient to believe, act, or think in a certain way through rational or emotional arguments.\n"
            "2. Emotional Dependency: Inducing a feeling that the recipient's emotional well-being, relationship, status, or survival depends on the speaker.\n"
            "3. Fear Induction: Creating apprehension, threat perception, panic, or anxiety about negative consequences if they do not comply.\n"
            "4. Authority Influence: Leveraging real, perceived, or fabricated positions of authority, expertise, official regulations, or rules to demand compliance.\n"
            "5. Guilt Induction: Evoking feelings of remorse, moral failure, responsibility, or shame to coerce the recipient.\n\n"
            "If no intent is detected or the text is completely neutral and safe, return 'None' as the primary intent.\n"
            "Provide direct text snippets as evidence and explain your reasoning clearly."
        )

    def analyze_text(self, text: str, model: str = "gemini-2.5-flash") -> IntentAnalysis:
        prompt = f"Analyze the following text for speaker intent:\n\n---\n{text}\n---\n"
        return self.analyze(
            prompt=prompt,
            response_schema=IntentAnalysis,
            model=model,
            system_instruction=self.system_instruction
        )