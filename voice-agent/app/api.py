from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import os
from pathlib import Path
from app.service import voice_service
from app.schemas import (
    VoiceResponse, TTSRequest, SupportedLanguage,
    HealthResponse, VoiceProcessRequest
)

router = APIRouter()

# Mount static files for audio serving
static_dir = Path("app/static")
static_dir.mkdir(exist_ok=True)
audio_dir = static_dir / "audio"
audio_dir.mkdir(exist_ok=True)


@router.post("/process", response_model=VoiceResponse)
async def process_voice(
    file: UploadFile = File(...),
    language: SupportedLanguage = Form(default=SupportedLanguage.VIETNAMESE),
    enable_tts: bool = Form(default=True)
):
    """
    Process voice input and return transcript, intent, entities, and optional TTS response
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    # Process the audio file
    response = await voice_service.process_audio_file(file, language)

    # If TTS is disabled, remove audio URL
    if not enable_tts:
        response.audio_url = None

    return response


@router.post("/process-text", response_model=VoiceResponse)
async def process_text(request: VoiceProcessRequest):
    """
    Process text input directly without audio file
    """
    try:
        # Extract intent and entities from text
        intent = voice_service._extract_intent(request.text)
        entities = voice_service._extract_entities(request.text)
        confidence = voice_service._calculate_confidence(
            request.text, intent, entities)

        # Generate response
        response_text = voice_service._generate_response(
            intent, entities, request.text)

        # Generate TTS audio if requested
        audio_url = None
        if request.enable_tts:
            audio_url = await voice_service._generate_tts_audio(response_text, request.language)

        return VoiceResponse(
            transcript=request.text,
            intent=intent,
            entities=entities,
            confidence=confidence,
            response_text=response_text,
            audio_url=audio_url,
            processing_time_ms=0  # No processing time for text input
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Text processing failed: {str(e)}")


@router.post("/text-to-speech")
async def text_to_speech(request: TTSRequest):
    """
    Convert text to speech and return audio file path
    """
    audio_path = await voice_service.text_to_speech(request)
    return {"audio_url": audio_path}


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Check the health status of voice agent services
    """
    health_data = voice_service.health_check()
    return HealthResponse(
        status=health_data["status"],
        version="1.0.0",
        services=health_data["services"]
    )


@router.get("/static/audio/{filename}")
async def get_audio_file(filename: str):
    """
    Serve generated audio files
    """
    file_path = Path(f"app/static/audio/{filename}")

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")

    # Determine media type by extension
    media_type = "audio/mpeg" if filename.lower().endswith(".mp3") else "audio/wav"
    return FileResponse(path=str(file_path), media_type=media_type, filename=filename)


@router.get("/supported-languages")
async def get_supported_languages():
    """
    Get list of supported languages
    """
    return {
        "languages": [
            {"code": "vi-VN", "name": "Vietnamese"},
            {"code": "en-US", "name": "English (US)"},
            {"code": "ja-JP", "name": "Japanese"}
        ]
    }


@router.delete("/cleanup")
async def cleanup_audio_files():
    """
    Clean up old audio files (older than 1 hour)
    """
    try:
        audio_dir = Path("app/static/audio")
        if not audio_dir.exists():
            return {"message": "No audio directory found"}

        import time
        current_time = time.time()
        deleted_count = 0

        for audio_file in audio_dir.glob("*.wav"):
            file_age = current_time - audio_file.stat().st_mtime
            if file_age > 3600:  # 1 hour
                audio_file.unlink()
                deleted_count += 1

        return {"message": f"Cleaned up {deleted_count} old audio files"}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Cleanup failed: {str(e)}")
