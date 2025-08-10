from pydantic import BaseModel
from typing import Dict, List, Optional
from enum import Enum


class SupportedLanguage(str, Enum):
    VIETNAMESE = "vi-VN"
    ENGLISH = "en-US"
    JAPANESE = "ja-JP"


class AudioFormat(str, Enum):
    WAV = "wav"
    MP3 = "mp3"
    FLAC = "flac"
    M4A = "m4a"


class Intent(str, Enum):
    CREATE_ORDER = "create_order"
    CANCEL_ORDER = "cancel_order"
    CHECK_ORDER_STATUS = "check_order_status"
    GET_PRODUCT_INFO = "get_product_info"
    GREETING = "greeting"
    GOODBYE = "goodbye"
    UNKNOWN = "unknown"


class VoiceProcessRequest(BaseModel):
    # The input text to process (required for /voice/process-text)
    text: str
    # Preferred language for NLP/TTS
    language: Optional[SupportedLanguage] = SupportedLanguage.VIETNAMESE
    # Whether to generate TTS audio for the response
    enable_tts: Optional[bool] = True


class Entity(BaseModel):
    type: str
    value: str
    confidence: float


class VoiceResponse(BaseModel):
    transcript: str
    intent: Intent
    entities: List[Entity]
    confidence: float
    response_text: str
    audio_url: Optional[str] = None
    processing_time_ms: int


class TTSRequest(BaseModel):
    text: str
    language: Optional[SupportedLanguage] = SupportedLanguage.VIETNAMESE
    voice_speed: Optional[float] = 1.0


class HealthResponse(BaseModel):
    status: str
    version: str
    services: Dict[str, bool]
