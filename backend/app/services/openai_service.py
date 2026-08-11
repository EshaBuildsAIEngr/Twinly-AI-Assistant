from openai import OpenAI
from app.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)


def chat_completion(messages: list, tools: list = None, tool_choice="auto"):
    """Thin wrapper around OpenAI chat completions with optional tool-calling."""
    kwargs = {
        "model": settings.OPENAI_MODEL,
        "messages": messages,
    }
    if tools:
        kwargs["tools"] = tools
        kwargs["tool_choice"] = tool_choice
    return client.chat.completions.create(**kwargs)


def transcribe_audio(file_path: str) -> str:
    """Transcribe a WhatsApp/Instagram voice note using Whisper."""
    with open(file_path, "rb") as f:
        result = client.audio.transcriptions.create(model="whisper-1", file=f)
    return result.text


def get_embedding(text: str) -> list:
    result = client.embeddings.create(model=settings.OPENAI_EMBEDDING_MODEL, input=text)
    return result.data[0].embedding
