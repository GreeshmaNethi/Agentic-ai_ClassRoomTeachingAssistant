import json
import time
from google import genai
from google.genai import types
from pydantic import BaseModel
from typing import Type, Any, Optional, List
from app.core.config import settings

# Models to try in order of preference (Fastest low-latency first)
MODELS_TO_TRY = [
    'gemini-3.5-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash',
    'gemini-3.8-flash',
]

def get_client() -> Optional[genai.Client]:
    if not settings.GEMINI_API_KEY:
        return None
    return genai.Client(api_key=settings.GEMINI_API_KEY)

def generate_structured_content(
    prompt: str,
    response_schema: Type[BaseModel],
    system_instruction: str = "You are a helpful educational assistant."
) -> Any:
    client = get_client()
    if not client:
        raise ValueError(
            "Gemini API Key is not configured. Please set GEMINI_API_KEY in your .env file."
        )

    last_error = None
    for model_name in MODELS_TO_TRY:
        for attempt in range(2):
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema=response_schema,
                        temperature=0.7,
                        system_instruction=system_instruction,
                    ),
                )
                return response_schema.model_validate_json(response.text)
            except Exception as e:
                last_error = e
                err_str = str(e)
                if '404' in err_str or 'NOT_FOUND' in err_str:
                    break  # Skip to next model immediately
                if '429' in err_str or 'RESOURCE_EXHAUSTED' in err_str:
                    break  # Skip to next model immediately
                if '503' in err_str or 'UNAVAILABLE' in err_str:
                    break  # High demand on this model, failover to next model immediately
                raise  # Unknown error, raise immediately

    raise ValueError(
        f"All AI models are currently unavailable. Please try again in a few minutes. Last error: {last_error}"
    )

def generate_chat_response(
    messages: list,
    system_instruction: str = "You are a helpful educational assistant."
) -> str:
    client = get_client()
    if not client:
        raise ValueError(
            "Gemini API Key is not configured. Please set GEMINI_API_KEY in your .env file."
        )

    formatted_messages = []
    for msg in messages:
        role = "user" if msg["role"] == "user" else "model"
        formatted_messages.append(
            types.Content(
                role=role, parts=[types.Part.from_text(text=msg["content"])]
            )
        )

    last_error = None
    for model_name in MODELS_TO_TRY:
        for attempt in range(2):
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=formatted_messages,
                    config=types.GenerateContentConfig(
                        temperature=0.7,
                        system_instruction=system_instruction,
                    ),
                )
                return response.text
            except Exception as e:
                last_error = e
                err_str = str(e)
                if '404' in err_str or 'NOT_FOUND' in err_str:
                    break
                if '429' in err_str or 'RESOURCE_EXHAUSTED' in err_str:
                    break
                if '503' in err_str or 'UNAVAILABLE' in err_str:
                    break
                raise

    raise ValueError(
        f"All AI models are currently unavailable. Please try again in a few minutes. Last error: {last_error}"
    )
