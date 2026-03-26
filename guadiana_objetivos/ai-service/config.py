from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    supabase_url: str
    supabase_service_role_key: str

    ai_provider: str = "anthropic"
    ai_api_key: str
    ai_model: str = "claude-sonnet-4-6"

    api_secret_key: str

    whatsapp_api_token: str = ""
    whatsapp_phone_number_id: str = ""

    host: str = "0.0.0.0"
    port: int = 8000


settings = Settings()  # type: ignore[call-arg]
