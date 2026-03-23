"""POST /analyze — Analiza evidencias de un entregable y guarda el resultado."""
from fastapi import APIRouter, HTTPException
from models import AnalyzeRequest, AnalyzeResponse, AIFindings
from services.supabase_client import get_supabase
from services.storage import download_evidence_file, extract_text_from_pdf, image_to_base64
from services.ai_client import analyze_with_claude
from services.whatsapp import notify_analysis_result

router = APIRouter()

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
PDF_EXTENSION = ".pdf"


def _detect_media_type(path: str) -> str:
    ext = path.rsplit(".", 1)[-1].lower() if "." in path else ""
    mapping = {
        "jpg": "image/jpeg", "jpeg": "image/jpeg",
        "png": "image/png", "gif": "image/gif", "webp": "image/webp",
        "pdf": "application/pdf",
    }
    return mapping.get(ext, "application/octet-stream")


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_deliverable(request: AnalyzeRequest) -> AnalyzeResponse:
    supabase = get_supabase()

    # 1. Obtener prompt activo de verificación
    prompt_row = (
        supabase.table("ai_prompts")
        .select("system_prompt, name")
        .eq("context", "verification")
        .eq("is_active", True)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    system_prompt = (
        prompt_row.data[0]["system_prompt"]
        if prompt_row.data
        else "Analiza la evidencia y determina si cumple con el objetivo."
    )
    prompt_name = prompt_row.data[0]["name"] if prompt_row.data else "default"

    # 2. Obtener evidencias de la BD
    evidences_data = []
    if request.evidence_ids:
        ev_result = (
            supabase.table("objective_evidences")
            .select("id, storage_path, evidence_url, text_content, submitted_by")
            .in_("id", request.evidence_ids)
            .execute()
        )
        evidences_data = ev_result.data or []

    # 3. Construir contenido para Claude
    user_content: list[dict] = []

    # Contexto del objetivo y entregable
    context_text = (
        f"OBJETIVO: {request.objective_title}\n"
        f"DESCRIPCIÓN DEL OBJETIVO: {request.objective_description or 'No especificada'}\n\n"
        f"ENTREGABLE A EVALUAR: {request.deliverable_title}\n"
        f"DESCRIPCIÓN DEL ENTREGABLE: {request.deliverable_description or 'No especificada'}\n\n"
        f"EVIDENCIAS PRESENTADAS ({len(evidences_data)}):"
    )
    user_content.append({"type": "text", "text": context_text})

    evidence_ids_used: list[str] = []

    for i, ev in enumerate(evidences_data, 1):
        ev_id = str(ev.get("id", ""))
        evidence_ids_used.append(ev_id)

        # Evidencia de texto
        if ev.get("text_content"):
            user_content.append({
                "type": "text",
                "text": f"\nEvidencia {i} (texto):\n{ev['text_content']}",
            })

        # Evidencia por archivo en Storage
        elif ev.get("storage_path"):
            path: str = ev["storage_path"]
            ext = f".{path.rsplit('.', 1)[-1].lower()}" if "." in path else ""
            file_bytes = await download_evidence_file(path)

            if file_bytes:
                if ext == PDF_EXTENSION:
                    pdf_text = extract_text_from_pdf(file_bytes)
                    if pdf_text:
                        user_content.append({
                            "type": "text",
                            "text": f"\nEvidencia {i} (PDF — texto extraído):\n{pdf_text[:4000]}",
                        })
                    else:
                        user_content.append({
                            "type": "text",
                            "text": f"\nEvidencia {i}: PDF sin texto extraíble.",
                        })
                elif ext.lstrip(".") in {"jpg", "jpeg", "png", "gif", "webp"}:
                    b64 = image_to_base64(file_bytes)
                    media_type = _detect_media_type(path)
                    user_content.append({
                        "type": "image",
                        "source": {"type": "base64", "media_type": media_type, "data": b64},
                    })
                else:
                    user_content.append({
                        "type": "text",
                        "text": f"\nEvidencia {i}: archivo adjunto (tipo no soportado para análisis automático).",
                    })

        # URL externa
        elif ev.get("evidence_url"):
            user_content.append({
                "type": "text",
                "text": f"\nEvidencia {i} (URL): {ev['evidence_url']}",
            })

    user_content.append({
        "type": "text",
        "text": "\nBasándote en las evidencias anteriores, evalúa si el entregable cumple con el objetivo y responde en JSON.",
    })

    # 4. Llamar a Claude
    ai_result = await analyze_with_claude(
        system_prompt=system_prompt,
        user_content=user_content,
    )

    verdict = ai_result.get("verdict", "needs_review")
    confidence = float(ai_result.get("confidence", 0.0))
    summary = ai_result.get("summary", "Análisis completado.")
    raw_findings = ai_result.get("findings", {})
    findings = AIFindings(
        positive=raw_findings.get("positive", []),
        negative=raw_findings.get("negative", []),
    )

    # 5. Guardar resultado en Supabase
    insert_result = (
        supabase.table("ai_analysis_results")
        .insert({
            "deliverable_id": request.deliverable_id,
            "evidence_ids": evidence_ids_used,
            "verdict": verdict,
            "confidence": confidence,
            "summary": summary,
            "findings": {"positive": findings.positive, "negative": findings.negative},
            "prompt_used": prompt_name,
            "model_used": f"{settings.ai_model}",
        })
        .execute()
    )

    analysis_id = insert_result.data[0]["id"] if insert_result.data else "unknown"

    # 6. Notificación WhatsApp (opcional, si el asignado tiene número)
    if request.notify_whatsapp and evidences_data:
        assignee_id = evidences_data[0].get("submitted_by")
        if assignee_id:
            await notify_analysis_result(
                deliverable_title=request.deliverable_title,
                verdict=verdict,
                summary=summary,
                user_id=assignee_id,
            )

    return AnalyzeResponse(
        analysis_id=analysis_id,
        deliverable_id=request.deliverable_id,
        verdict=verdict,
        confidence=confidence,
        summary=summary,
        findings=findings,
        model_used=settings.ai_model,
    )
