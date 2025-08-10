import os
from pathlib import Path
from typing import List

class Config:
    """Configuration settings for the voice agent"""
    
    # API Settings
    API_TITLE = "Voice Agent API"
    API_VERSION = "1.0.0"
    API_DESCRIPTION = "Advanced voice processing API with speech-to-text, text-to-speech, and NLP capabilities"
    
    # Audio Processing Settings
    MAX_AUDIO_FILE_SIZE = int(os.getenv("MAX_AUDIO_FILE_SIZE", 10485760))  # 10MB
    SUPPORTED_AUDIO_FORMATS = ["wav", "mp3", "flac", "m4a"]
    AUDIO_SAMPLE_RATE = 16000
    
    # Speech Recognition Settings
    SPEECH_RECOGNITION_TIMEOUT = int(os.getenv("SPEECH_RECOGNITION_TIMEOUT", 10))
    SPEECH_RECOGNITION_PHRASE_TIMEOUT = int(os.getenv("SPEECH_RECOGNITION_PHRASE_TIMEOUT", 5))
    
    # Text-to-Speech Settings
    TTS_VOICE_RATE = int(os.getenv("TTS_VOICE_RATE", 180))
    TTS_VOICE_VOLUME = float(os.getenv("TTS_VOICE_VOLUME", 0.9))
    
    # File Storage Settings
    STATIC_DIR = Path("app/static")
    AUDIO_DIR = STATIC_DIR / "audio"
    TEMP_DIR = Path("/tmp/voice_agent")
    
    # Cleanup Settings
    AUDIO_FILE_RETENTION_HOURS = 1
    
    # Logging Settings
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    
    # NLP Settings
    CONFIDENCE_THRESHOLD = 0.7
    MIN_TRANSCRIPT_LENGTH = 2
    
    # Language Support
    DEFAULT_LANGUAGE = "vi-VN"
    SUPPORTED_LANGUAGES = {
        "vi-VN": "Vietnamese",
        "en-US": "English (US)",
        "ja-JP": "Japanese"
    }
    
    @classmethod
    def create_directories(cls):
        """Create necessary directories if they don't exist"""
        cls.STATIC_DIR.mkdir(exist_ok=True)
        cls.AUDIO_DIR.mkdir(exist_ok=True)
        cls.TEMP_DIR.mkdir(exist_ok=True)

config = Config()