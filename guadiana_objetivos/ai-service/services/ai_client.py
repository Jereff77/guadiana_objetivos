"""Cliente unificado para la API de Claude (Anthropic)."""
import json
import anthropic
from config import settings


def get_anthropic_client() -> anthropic.Anthropic:
    return anthropic.Anthropic(api_key=settings.ai_api_key)


async def analyze_with_claude(
    system_prompt: str,
    user_content: list[dict],
    model: str | None = None,
) -> dict:
    """
    Llama a Claude con el prompt del sistema y el contenido del usuario.
    Retorna el JSON parseado de la respuesta.
    """
    client = get_anthropic_client()
    used_model = model or settings.ai_model

    response = client.messages.create(
        model=used_model,
        max_tokens=1024,
        system=system_prompt,
        messages=[{"role": "user", "content": user_content}],
    )

    raw_text = response.content[0].text if response.content else "{}"

    # Intentar parsear JSON; si falla, devolver estructura mínima
    try:
        # Buscar bloque JSON en la respuesta (puede estar envuelto en markdown)
        text = raw_text.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        return json.loads(text)
    except (json.JSONDecodeError, IndexError):
        return {
            "verdict": "needs_review",
            "confidence": 0.0,
            "summary": raw_text[:500] if raw_text else "Sin respuesta del modelo.",
            "findings": {"positive": [], "negative": ["No se pudo parsear la respuesta del modelo."]},
        }


async def chat_with_claude(
    system_prompt: str,
    messages: list[dict],
    model: str | None = None,
) -> str:
    """Chat libre con Claude. Retorna el texto de la respuesta."""
    client = get_anthropic_client()
    used_model = model or settings.ai_model

    response = client.messages.create(
        model=used_model,
        max_tokens=2048,
        system=system_prompt,
        messages=messages,
    )

    return response.content[0].text if response.content else ""
