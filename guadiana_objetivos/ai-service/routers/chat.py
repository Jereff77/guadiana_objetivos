"""POST /chat — Chat contextualizado con contenido LMS."""
from fastapi import APIRouter
from models import ChatRequest, ChatResponse
from services.supabase_client import get_supabase
from services.ai_client import chat_with_claude

router = APIRouter()

LMS_CHAT_SYSTEM_PROMPT = """Eres un asistente de capacitación experto de Llantas y Rines del Guadiana.
Tu función es responder preguntas sobre los contenidos de capacitación de la empresa de forma clara y concisa.
Basa tus respuestas en el material de capacitación proporcionado en el contexto.
Si la respuesta no está en el material, indícalo claramente y sugiere consultar con el área correspondiente.
Responde siempre en español."""


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    supabase = get_supabase()

    # 1. Obtener prompt del sistema para LMS chat (si existe configurado)
    prompt_row = (
        supabase.table("ai_prompts")
        .select("system_prompt")
        .eq("context", "lms_chat")
        .eq("is_active", True)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    system_prompt = (
        prompt_row.data[0]["system_prompt"]
        if prompt_row.data
        else LMS_CHAT_SYSTEM_PROMPT
    )

    # 2. Recuperar contenido LMS para contexto (si se proporcionan IDs)
    sources: list[dict] = []
    context_blocks: list[str] = []

    if request.content_ids:
        content_result = (
            supabase.table("lms_content")
            .select("id, title, description, text_body, category, content_type")
            .in_("id", request.content_ids)
            .eq("is_published", True)
            .execute()
        )

        for item in content_result.data or []:
            sources.append({
                "id": item["id"],
                "title": item["title"],
                "category": item.get("category", ""),
            })
            block = f"[{item['title']}]\n"
            if item.get("description"):
                block += f"Descripción: {item['description']}\n"
            if item.get("text_body"):
                block += f"Contenido: {item['text_body'][:2000]}\n"
            context_blocks.append(block)

    # 3. Enriquecer el system prompt con el contexto LMS
    if context_blocks:
        context_section = "\n\n---\nMATERIAL DE CAPACITACIÓN DISPONIBLE:\n" + "\n\n".join(context_blocks)
        system_prompt = system_prompt + context_section

    # 4. Convertir mensajes al formato de Anthropic
    anthropic_messages = [
        {"role": msg.role, "content": msg.content}
        for msg in request.messages
    ]

    # 5. Llamar a Claude
    reply = await chat_with_claude(
        system_prompt=system_prompt,
        messages=anthropic_messages,
    )

    return ChatResponse(reply=reply, sources=sources)
