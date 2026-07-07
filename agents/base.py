from utils.llm import GeminiClient
from pydantic import BaseModel
from typing import Type, TypeVar, Optional

T = TypeVar('T', bound=BaseModel)

class BaseAgent:
    """
    Base class for all analyzers/agents in the pipeline.
    """
    def __init__(self, name: str, client: GeminiClient):
        self.name = name
        self.client = client

    def analyze(
        self,
        prompt: str,
        response_schema: Type[T],
        model: str = "gemini-2.5-flash",
        system_instruction: Optional[str] = None
    ) -> T:
        """
        Executes analysis by calling the LLM wrapper with a custom prompt,
        system instructions, and structured Pydantic schema validation.
        """
        if not self.client.is_configured():
            raise ValueError(f"Gemini client is not configured. Please supply an API key in the sidebar.")
            
        return self.client.generate_structured(
            prompt=prompt,
            response_schema=response_schema,
            model=model,
            system_instruction=system_instruction
        )