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

        # Query chatbot for intelligent response
        chatbot_response = await voice_service.query_chatbot(request.text, request.language.value)

        # Get product recommendations if relevant
        product_recommendations = []
        if intent in ["get_product_info", "search_products"]:
            product_recommendations = await voice_service.get_product_recommendations(intent, entities)

        # Generate enhanced response
        response_text = voice_service._generate_enhanced_response(
            intent, entities, request.text, chatbot_response, product_recommendations)

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
            processing_time_ms=0,  # No processing time for text input
            product_recommendations=product_recommendations
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


@router.get("/products/search")
async def search_products_by_voice(
    query: str,
    category: str = None,
    price_range: str = None,
    limit: int = 10
):
    """
    Search products using voice-based queries
    """
    try:
        # Extract entities from the voice query
        entities = voice_service._extract_entities(query)

        # Get product recommendations
        recommendations = await voice_service.get_product_recommendations("search_products", entities)

        # Apply additional filters
        if category:
            recommendations = [p for p in recommendations if p.get(
                'category', {}).get('name', '').lower() == category.lower()]

        if price_range:
            recommendations = [p for p in recommendations if voice_service._matches_price_range(
                p.get('price', 0), price_range)]

        return {
            "query": query,
            "products": recommendations[:limit],
            "total_found": len(recommendations),
            "filters_applied": {
                "category": category,
                "price_range": price_range,
                "limit": limit
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Product search failed: {str(e)}")


@router.get("/products/categories")
async def get_product_categories():
    """
    Get all available product categories
    """
    try:
        await voice_service.refresh_product_cache()
        categories = list(voice_service.category_cache.values())
        return {
            "categories": categories,
            "total": len(categories)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch categories: {str(e)}")


@router.get("/products/recommendations")
async def get_voice_recommendations(
    intent: str = None,
    category: str = None,
    price_max: float = None
):
    """
    Get product recommendations based on voice intent and preferences
    """
    try:
        # Create mock entities for recommendation
        entities = []
        if category:
            entities.append(voice_service.Entity(
                type="category", value=category, confidence=0.9))
        if price_max:
            entities.append(voice_service.Entity(
                type="price_range", value=f"under_{price_max}", confidence=0.8))

        recommendations = await voice_service.get_product_recommendations(
            intent or "get_product_info",
            entities
        )

        return {
            "intent": intent,
            "filters": {"category": category, "price_max": price_max},
            "recommendations": recommendations,
            "total": len(recommendations)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get recommendations: {str(e)}")


@router.post("/chatbot/query")
async def query_chatbot_via_voice(
    text: str,
    language: str = "vi-VN"
):
    """
    Query the chatbot service via voice agent
    """
    try:
        response = await voice_service.query_chatbot(text, language)
        return {
            "query": text,
            "language": language,
            "response": response
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Chatbot query failed: {str(e)}")


@router.get("/voice/stream")
async def stream_voice_response(
    query: str,
    language: SupportedLanguage = SupportedLanguage.VIETNAMESE
):
    """
    Stream voice response for real-time interaction
    """
    try:
        # Process the query
        intent = voice_service._extract_intent(query)
        entities = voice_service._extract_entities(query)

        # Get chatbot response
        chatbot_response = await voice_service.query_chatbot(query, language.value)

        # Get product recommendations
        product_recommendations = await voice_service.get_product_recommendations(intent, entities)

        # Generate response
        response_text = voice_service._generate_enhanced_response(
            intent, entities, query, chatbot_response, product_recommendations
        )

        return {
            "query": query,
            "intent": intent,
            "response": response_text,
            "products": product_recommendations[:3],  # Top 3 for voice
            "suggested_actions": [
                "Tìm kiếm sản phẩm tương tự",
                "Xem danh mục",
                "Kiểm tra giá cả",
                "Đặt hàng"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Voice streaming failed: {str(e)}")
