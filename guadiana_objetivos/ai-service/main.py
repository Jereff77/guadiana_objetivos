"""Servicio Python de IA — Guadiana Objetivos (M4)."""
import uvicorn
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from routers import analyze, chat
from config import settings

app = FastAPI(
    title="Guadiana AI Service",
    description="Servicio de análisis IA para verificación de objetivos y chat LMS.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None,
)

# CORS — solo acepta peticiones del servidor Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restringir en producción al dominio Next.js
    allow_credentials=False,
    allow_methods=["POST", "GET"],
    allow_headers=["Authorization", "Content-Type"],
)


# ── Middleware de autenticación por API Key ────────────────────────────────────

@app.middleware("http")
async def verify_api_key(request: Request, call_next):
    # Health check sin autenticación
    if request.url.path in ("/health", "/", "/docs", "/openapi.json"):
        return await call_next(request)

    api_key = request.headers.get("X-API-Key") or request.headers.get("Authorization", "").removeprefix("Bearer ")
    if not api_key or api_key != settings.api_secret_key:
        raise HTTPException(status_code=401, detail="API Key inválida o ausente.")

    return await call_next(request)


# ── Rutas ──────────────────────────────────────────────────────────────────────

app.include_router(analyze.router, tags=["Análisis IA"])
app.include_router(chat.router, tags=["Chat LMS"])


@app.get("/")
async def root():
    return {"status": "ok", "service": "Guadiana AI Service", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=True)
