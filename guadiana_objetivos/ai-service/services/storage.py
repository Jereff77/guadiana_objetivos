"""Descarga evidencias desde Supabase Storage."""
import httpx
from services.supabase_client import get_supabase


async def download_evidence_file(storage_path: str, bucket: str = "objective-evidences") -> bytes | None:
    """Descarga un archivo del bucket de evidencias y retorna sus bytes."""
    try:
        supabase = get_supabase()
        response = supabase.storage.from_(bucket).download(storage_path)
        return response
    except Exception:
        return None


async def get_signed_url(storage_path: str, bucket: str = "objective-evidences", expires_in: int = 300) -> str | None:
    """Genera una URL firmada válida por `expires_in` segundos."""
    try:
        supabase = get_supabase()
        response = supabase.storage.from_(bucket).create_signed_url(storage_path, expires_in)
        return response.get("signedURL")
    except Exception:
        return None


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extrae texto plano de un PDF."""
    try:
        import io
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(pdf_bytes))
        pages_text = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                pages_text.append(text.strip())
        return "\n\n".join(pages_text)
    except Exception:
        return ""


def image_to_base64(image_bytes: bytes) -> str:
    """Convierte imagen a base64 para enviar a la API."""
    import base64
    return base64.standard_b64encode(image_bytes).decode("utf-8")
