"""Notificaciones vía WhatsApp Business API."""
import httpx
from config import settings


async def send_whatsapp_message(phone_e164: str, message: str) -> bool:
    """
    Envía un mensaje de texto a través de la WhatsApp Business API.
    `phone_e164`: número en formato E.164 (ej: +521234567890)
    Retorna True si fue exitoso.
    """
    if not settings.whatsapp_api_token or not settings.whatsapp_phone_number_id:
        return False

    # Normalizar número: quitar el '+' para la API de Meta
    phone = phone_e164.lstrip("+")

    url = f"https://graph.facebook.com/v19.0/{settings.whatsapp_phone_number_id}/messages"
    headers = {
        "Authorization": f"Bearer {settings.whatsapp_api_token}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": phone,
        "type": "text",
        "text": {"body": message},
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(url, json=payload, headers=headers)
            return response.status_code == 200
    except Exception:
        return False


async def notify_analysis_result(
    deliverable_title: str,
    verdict: str,
    summary: str,
    user_id: str,
) -> bool:
    """
    Obtiene el WhatsApp del usuario desde Supabase y envía notificación del resultado.
    """
    from services.supabase_client import get_supabase

    supabase = get_supabase()
    result = supabase.table("profiles").select("whatsapp, full_name").eq("id", user_id).single().execute()

    if not result.data or not result.data.get("whatsapp"):
        return False

    whatsapp = result.data["whatsapp"]
    name = result.data.get("full_name", "Colaborador")

    verdict_labels = {
        "approved": "✅ APROBADO",
        "rejected": "❌ RECHAZADO",
        "needs_review": "⚠️ REQUIERE REVISIÓN",
    }
    label = verdict_labels.get(verdict, verdict.upper())

    message = (
        f"Hola {name}, el análisis IA de tu entregable *{deliverable_title}* ha concluido:\n\n"
        f"*Resultado:* {label}\n\n"
        f"*Resumen:* {summary}\n\n"
        f"Ingresa a la plataforma para ver el detalle completo."
    )

    return await send_whatsapp_message(whatsapp, message)
