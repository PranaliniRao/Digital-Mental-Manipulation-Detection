import json
import abc
from typing import Dict, Any, List
from services.llm_service import call_llm

class BaseAgent(abc.ABC):
    """
    BaseAgent abstract class for the Digital Manipulation Detection System.
    All specialized agents inherit from this class.
    """

    def __init__(self, agent_name: str, system_prompt_template: str, user_prompt_template: str):
        self.agent_name = agent_name
        self.system_prompt_template = system_prompt_template
        self.user_prompt_template = user_prompt_template

    @abc.abstractmethod
    def get_labels(self) -> List[str]:
        """Return the list of valid psychological/tactical labels specific to this agent."""
        pass

    def build_prompt(self, text: str, **kwargs) -> str:
        """
        Builds the complete prompt string using the templates.
        Kept for backward compatibility; prefer analyze() which uses split prompts.
        """
        system_prompt, user_prompt = self.build_prompt_parts(text, **kwargs)
        return f"System Instruction:\n{system_prompt}\n\nUser Input:\n{user_prompt}"

    def build_prompt_parts(self, text: str, **kwargs) -> tuple:
        """
        Returns (system_prompt, user_prompt) as separate strings
        so the LLM service can send them as distinct system/user messages.
        """
        labels_str = ", ".join(self.get_labels())

        user_prompt = self.user_prompt_template.format(
            text=text,
            labels=labels_str,
            **kwargs
        )

        return self.system_prompt_template, user_prompt

    def call_llm(self, prompt: str, system_prompt: str | None = None) -> str:
        """Call Groq via llm_service. Agents never import the SDK directly."""
        return call_llm(prompt, system_prompt=system_prompt)

    def parse_response(self, response_text: str) -> Dict[str, Any]:
        """
        Parses the raw model output text and returns a standardized JSON structure.
        """
        cleaned = response_text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        standard_response = {
            "agent_name": self.agent_name,
            "label": "Unknown",
            "confidence": 0.0,
            "reasoning": "Failed to parse model response.",
            "evidence": [],
            "risk_contribution": 0.0
        }

        try:
            data = json.loads(cleaned)
            standard_response["label"] = str(data.get("label", "None"))
            standard_response["confidence"] = float(data.get("confidence", 0.0))
            standard_response["reasoning"] = str(data.get("reasoning", ""))
            
            evidence = data.get("evidence", [])
            if isinstance(evidence, list):
                standard_response["evidence"] = [str(item) for item in evidence]
            elif isinstance(evidence, str):
                standard_response["evidence"] = [evidence]
                
            standard_response["risk_contribution"] = float(data.get("risk_contribution", 0.0))
        except (json.JSONDecodeError, ValueError, TypeError) as e:
            standard_response["reasoning"] = f"Parsing error: {str(e)}. Raw response: {response_text}"
            
        return standard_response

    def analyze(self, text: str, **kwargs) -> Dict[str, Any]:
        """
        Orchestrates prompt creation, model invocation, and response parsing.
        Retries once if the first LLM response produces invalid JSON.
        """
        system_prompt, user_prompt = self.build_prompt_parts(text, **kwargs)

        for attempt in range(1, 3):
            raw_response = self.call_llm(user_prompt, system_prompt=system_prompt)
            result = self.parse_response(raw_response)
            if result.get("label", "Unknown") != "Unknown":
                return result
            if attempt == 1:
                print(f"[{self.agent_name}] JSON parse failed, retrying...")

        return result
