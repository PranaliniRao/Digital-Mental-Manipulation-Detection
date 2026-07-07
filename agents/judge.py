from pydantic import BaseModel, Field
from agents.base import BaseAgent
from utils.llm import GeminiClient
from typing import Dict, Any, Literal

class JudgeAnalysis(BaseModel):
    manipulation_detected: bool = Field(
        description="True if digital manipulation is detected by the LLM, False otherwise."
    )
    confidence_score: int = Field(
        description="LLM's confidence score for the final assessment (0-100).",
        ge=0,
        le=100
    )
    psychological_risk_score: float = Field(
        description="The Psychological Manipulation Risk Score computed by the scoring engine."
    )
    agent_agreement: Literal["Strong Agreement", "Moderate Agreement", "Disagreement"] = Field(
        description="The level of agreement between the LLM's final assessment and the mathematical risk score."
    )
    disagreement_explanation: str = Field(
        description="Explanation detailing why the LLM's logic and the Risk Engine's score agree or disagree, and what factors caused any differences."
    )
    explanation: str = Field(
        description="Detailed, comprehensive final explanation of why the content is manipulative, combining the upstream agent factors."
    )
    defense_recommendation: str = Field(
        description="Practical cognitive defense recommendations to guard against this specific manipulation."
    )

class JudgeAgent(BaseAgent):
    def __init__(self, client: GeminiClient):
        super().__init__(name="Judge Agent", client=client)
        self.system_instruction = (
            "You are a senior behavioral scientist and cognitive security expert specializing in digital manipulation forensics.\n"
            "Your role is to act as the 'Judge Agent' that aggregates all upstream analyses and the scoring engine's output to perform a final manipulation assessment.\n\n"
            "You will be given:\n"
            "1. The original raw input text.\n"
            "2. Intent Analysis: The speaker's primary intent, other detected intents, direct evidence, and reasoning.\n"
            "3. Vulnerability Analysis: The targeted vulnerabilities, severity, demographics, and analysis.\n"
            "4. Cognitive Bias Analysis: The triggered cognitive biases, confidence, evidence, and overall bias score.\n"
            "5. Influence Strategy Analysis: The specific influence strategies, evidence, tactics count, and subtlety.\n"
            "6. Psychological Risk Engine Output: The calculated manipulation risk score, components contribution, risk level, and computation logic.\n\n"
            "Your tasks:\n"
            "1. Review the input text and all upstream agent analyses to determine if the text is manipulative (manipulation_detected = True/False).\n"
            "2. Assess how well your logical judgment agrees with the mathematical Psychological Risk Score (Strong Agreement, Moderate Agreement, Disagreement).\n"
            "3. Explain the relationship between the LLM's qualitative assessment and the Risk Engine's quantitative score in disagreement_explanation.\n"
            "4. Provide a comprehensive final explanation and actionable defense recommendations."
        )

    def analyze_pipeline(
        self,
        text: str,
        intent_output: Dict[str, Any],
        vulnerability_output: Dict[str, Any],
        bias_output: Dict[str, Any],
        influence_output: Dict[str, Any],
        risk_engine_output: Dict[str, Any],
        model: str = "gemini-2.5-flash"
    ) -> JudgeAnalysis:
        prompt = (
            f"Original Input Text:\n"
            f"```\n{text}\n```\n\n"
            f"Upstream Analysis 1: Intent Analysis:\n"
            f"```json\n{intent_output}\n```\n\n"
            f"Upstream Analysis 2: Vulnerability Analysis:\n"
            f"```json\n{vulnerability_output}\n```\n\n"
            f"Upstream Analysis 3: Cognitive Bias Analysis:\n"
            f"```json\n{bias_output}\n```\n\n"
            f"Upstream Analysis 4: Influence Strategy Analysis:\n"
            f"```json\n{influence_output}\n```\n\n"
            f"Upstream Analysis 5: Psychological Risk Engine Output:\n"
            f"```json\n{risk_engine_output}\n```\n\n"
            f"Please synthesize these inputs and generate the final Judge Analysis."
        )
        return self.analyze(
            prompt=prompt,
            response_schema=JudgeAnalysis,
            model=model,
            system_instruction=self.system_instruction
        )
