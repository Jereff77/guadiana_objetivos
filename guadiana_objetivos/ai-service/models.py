from typing import Any
from pydantic import BaseModel, Field


# ── /analyze ──────────────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    deliverable_id: str = Field(..., description="UUID del entregable a analizar")
    objective_title: str = Field(..., description="Título del objetivo")
    objective_description: str | None = Field(None, description="Descripción del objetivo")
    deliverable_title: str = Field(..., description="Título del entregable")
    deliverable_description: str | None = Field(None, description="Descripción del entregable")
    evidence_ids: list[str] = Field(default_factory=list, description="UUIDs de las evidencias")
    notify_whatsapp: bool = Field(False, description="Enviar notificación WhatsApp al asignado")


class AIFindings(BaseModel):
    positive: list[str] = Field(default_factory=list)
    negative: list[str] = Field(default_factory=list)


class AnalyzeResponse(BaseModel):
    analysis_id: str
    deliverable_id: str
    verdict: str  # approved | rejected | needs_review
    confidence: float
    summary: str
    findings: AIFindings
    model_used: str


# ── /chat ─────────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str  # user | assistant
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(..., description="Historial de la conversación")
    content_ids: list[str] = Field(default_factory=list, description="IDs de contenido LMS para contexto")
    user_id: str | None = Field(None, description="UUID del usuario (para personalización)")


class ChatResponse(BaseModel):
    reply: str
    sources: list[dict[str, Any]] = Field(default_factory=list)
