from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    spotify_client_id: str
    spotify_client_secret: str
    base_url: str = "http://127.0.0.1:3000"
    backend_url: str = "http://localhost:8000"
    jwt_secret: str = "change-me-in-production"
    lastfm_api_key: str = ""
    database_url: str = "sqlite+aiosqlite:///./tags.db"
    cors_origins: list[str] = ["http://127.0.0.1:3000", "http://localhost:3000"]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
