from pydantic import BaseModel, Field
from typing import List, Literal
from agents.base import BaseAgent
from utils.llm import GeminiClient

class DetectedBias(BaseModel):
    bias: Literal[
        "Authority Bias", 
        "Scarcity Bias", 
        "Loss Aversion", 
        "Reciprocity", 
        "Social Proof", 
        "Commitment & Consistency", 
        "Confirmation Bias", 
        "FOMO", 
        "None"
    ] = Field(description="The name of the detected cognitive bias.")
    confidence: int = Field(description="Confidence level of detection (0-100).", ge=0, le=100)
    evidence: str = Field(description="Exact quote or sentence from the text demonstrating the bias.")
    explanation: str = Field(description="Analysis of how this bias is triggered in the reader's mind.")

class BiasAnalysis(BaseModel):
    detected_biases: List[DetectedBias] = Field(description="List of detected cognitive biases from the pre-defined options.")
    confidence: int = Field(description="Overall confidence in the bias analysis (0-100).", ge=0, le=100)
    supporting_evidence: List[str] = Field(description="Key sentences representing cognitive bias triggers.")
    explanation: str = Field(description="Detailed overview of how the text attempts to exploit the reader's cognitive shortcuts.")
    overall_bias_score: int = Field(description="A derived score representing the density/severity of cognitive biases in the text (0-100).", ge=0, le=100)

class CognitiveBiasAnalyzerAgent(BaseAgent):
    def __init__(self, client: GeminiClient):
        super().__init__(name="Cognitive Bias Analyzer", client=client)
        self.system_instruction = (
            "You are an expert cognitive psychologist and behavioral researcher specializing in human reasoning and decision heuristics.\n"
            "Your task is to identify which cognitive biases are triggered or exploited in the provided text.\n"
            "Map the biases to the following categories:\n"
            "1. Authority Bias: Deference or compliance due to perceived expertise, titles, or official position.\n"
            "2. Scarcity Bias: Placing higher value on things that are perceived as rare, limited, or hard to obtain.\n"
            "3. Loss Aversion: The psychological tendency to prefer avoiding losses over acquiring equivalent gains.\n"
            "4. Reciprocity: The urge to return favors or comply because something free or helpful was given first.\n"
            "5. Social Proof: Looking to others' behavior or opinions to validate what is correct or desirable.\n"
            "6. Commitment & Consistency: Coercion based on getting a small initial agreement first, then demanding consistency.\n"
            "7. Confirmation Bias: Preying on existing beliefs or desires to bypass critical scrutiny.\n"
            "8. FOMO (Fear Of Missing Out): Inducing anxiety that others are enjoying a reward/experience from which the reader is excluded.\n\n"
            "Analyze the text, find specific evidence/quotes for each detected bias, count the tactics used, and rate the overall bias score (0-100) based on bias density."
        )

    def analyze_text(self, text: str, model: str = "gemini-2.5-flash") -> BiasAnalysis:
        prompt = f"Analyze the following text to identify triggered cognitive biases:\n\n---\n{text}\n---\n"
        return self.analyze(
            prompt=prompt,
            response_schema=BiasAnalysis,
            model=model,
            system_instruction=self.system_instruction
        )
