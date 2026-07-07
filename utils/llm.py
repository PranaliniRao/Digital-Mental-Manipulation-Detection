
import os
import streamlit as st
from google import genai
from google.genai import types
from google.genai.errors import APIError
from pydantic import BaseModel
from typing import Type, TypeVar, Optional

T = TypeVar('T', bound=BaseModel)

class GeminiClient:
    """
    Wrapper around the Google GenAI SDK to interact with Gemini models.
    Supports structured outputs using Pydantic models.
    """
    def __init__(self, api_key: Optional[str] = None):
        # First check explicit key, then fallback to environment variable
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        self._client = None
        if self.api_key:
            try:
                self._client = genai.Client(api_key=self.api_key)
            except Exception as e:
                st.error(f"Failed to initialize Gemini Client: {e}")

    def is_configured(self) -> bool:
        return self._client is not None

    def generate_structured(
        self,
        prompt: str,
        response_schema: Type[T],
        model: str = "gemini-2.5-flash",
        system_instruction: Optional[str] = None
    ) -> T:
        """
        Queries Gemini with a prompt and enforces a structured JSON schema based on a Pydantic model.
        """
        if not self._client:
            raise ValueError("Gemini Client is not configured. Please provide an API key.")

        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=response_schema,
            system_instruction=system_instruction,
            temperature=0.1,  # Low temperature for analytical accuracy and structure adherence
        )
        
        # Call the Google GenAI Client generate content endpoint
        response = self._client.models.generate_content(
            model=model,
            contents=prompt,
            config=config
        )
        
        # Parse and return the structured response
        return response_schema.model_validate_json(response.text)

    def generate_text(
        self,
        prompt: str,
        model: str = "gemini-2.5-flash",
        system_instruction: Optional[str] = None
    ) -> str:
        """
        Queries Gemini with a prompt and returns raw text.
        """
        if not self._client:
            raise ValueError("Gemini Client is not configured. Please provide an API key.")

        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.2,
        )
        response = self._client.models.generate_content(
            model=model,
            contents=prompt,
            config=config
        )
        return response.text