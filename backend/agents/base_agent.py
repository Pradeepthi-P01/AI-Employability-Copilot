from google import genai
from google.genai import types
import json
import logging
from backend.config import GEMINI_API_KEY

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY is not set. Agents will fail to communicate with Gemini API.")

class BaseAgent:
    def __init__(self, name: str, system_instruction: str = None):
        self.name = name
        self.system_instruction = system_instruction
        self.model_name = "gemini-2.5-flash"

    def query_llm(self, prompt: str, json_mode: bool = False) -> str:
        """
        Communicates with the Gemini API using the new google.genai SDK (REST).
        """
        if not GEMINI_API_KEY:
            raise ValueError("Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable.")

        try:
            client = genai.Client(api_key=GEMINI_API_KEY)

            config_kwargs = {}
            if self.system_instruction:
                config_kwargs["system_instruction"] = self.system_instruction
            if json_mode:
                config_kwargs["response_mime_type"] = "application/json"

            config = types.GenerateContentConfig(**config_kwargs) if config_kwargs else None

            response = client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config
            )
            return response.text
        except Exception as e:
            logger.error(f"Error querying Gemini API in {self.name}: {str(e)}")
            raise RuntimeError(f"Gemini API failure in agent '{self.name}': {str(e)}")

    def query_llm_json(self, prompt: str) -> dict:
        """
        Helper method to query Gemini and guarantee a python dict response.
        """
        raw_response = self.query_llm(prompt, json_mode=True)
        try:
            return json.loads(raw_response)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response in {self.name}: {raw_response}")
            raise ValueError(f"Agent '{self.name}' returned invalid JSON data: {str(e)}")
