from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
from app.service import fake_speech_to_text
from app.schemas import VoiceResponse

router = APIRouter()

@router.post("/voice/process", response_model=VoiceResponse)
async def process_voice(file: UploadFile = File(...)):
    transcript, intent = fake_speech_to_text(file.filename)
    return VoiceResponse(
        transcript=transcript,
        intent=intent,
        entities={"product": "Naruto", "action": "order"}
    )