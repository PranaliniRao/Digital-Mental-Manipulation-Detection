import json
import abc
from typing import Dict, Any, List

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
        """
        labels_str = ", ".join(self.get_labels())
        
        user_prompt = self.user_prompt_template.format(
            text=text,
            labels=labels_str,
            **kwargs
        )
        
        system_prompt = self.system_prompt_template
        
        return f"System Instruction:\n{system_prompt}\n\nUser Input:\n{user_prompt}"

    def call_llm(self, prompt: str) -> str:
        """
        Placeholder to call the LLM model. Subclasses or middleware will override/integrate
        the Qwen API here.
        """
        raise NotImplementedError("Qwen API will be integrated later.")

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
        """
        prompt = self.build_prompt(text, **kwargs)
        raw_response = self.call_llm(prompt)
        return self.parse_response(raw_response)
